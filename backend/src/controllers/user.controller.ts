import { Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { User } from '../models/user.model.js';
import { ProjectSupervisorAssignment, SiteInspectorAssignment } from '../models/assignment.model.js';
import { Project } from '../models/project.model.js';
import { Site } from '../models/site.model.js';
import { EntitlementService } from '../services/entitlement.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

const createUserSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().trim().optional(),
  employeeId: z.string().trim().optional(),
});

const updateUserSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100).optional(),
  phone: z.string().trim().optional(),
  employeeId: z.string().trim().optional(),
});

export class UserController {
  // =========================================================================
  // SUPERVISOR MANAGEMENT (ADMIN ONLY)
  // =========================================================================

  /**
   * POST /api/users/supervisors
   * Create a new supervisor account
   */
  static async createSupervisor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      if (!orgId) {
        sendError(res, 'Organization context missing', 400);
        return;
      }

      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation failed', 400);
        return;
      }

      const { fullName, email, password, phone, employeeId } = parsed.data;

      // Central Supervisor Seat Entitlement Check
      const seatCheck = await EntitlementService.canAddSupervisor(orgId);
      if (!seatCheck.allowed) {
        sendError(res, seatCheck.reason || 'Supervisor seat limit reached for your subscription plan', 403);
        return;
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        sendError(res, 'An account with this email address already exists', 409);
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({
        fullName,
        email,
        passwordHash,
        role: 'SUPERVISOR',
        organizationId: orgId,
        phone: phone || '',
        employeeId: employeeId || '',
        isActive: true,
      });

      await user.save();

      sendSuccess(res, user.toSanitized(), 'Supervisor account created successfully', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create supervisor';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/users/supervisors
   * List all supervisors for organization with project counts
   */
  static async listSupervisors(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      if (!orgId) {
        sendError(res, 'Organization context missing', 400);
        return;
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const skip = (page - 1) * limit;

      const { search, isActive } = req.query;

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(
          res,
          {
            inspectors: [],
            pagination: { total: 0, page, limit, totalPages: 1 },
          },
          'Inspectors retrieved (offline)'
        );
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(
          res,
          {
            supervisors: [],
            pagination: { total: 0, page, limit, totalPages: 1 },
          },
          'Supervisors retrieved (offline)'
        );
        return;
      }

      const filter: Record<string, any> = {
        organizationId: orgId,
        role: 'SUPERVISOR',
      };

      if (isActive !== undefined && isActive !== 'ALL') {
        filter.isActive = isActive === 'true';
      }

      if (search && typeof search === 'string' && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ fullName: regex }, { email: regex }, { employeeId: regex }];
      }

      const [total, supervisors] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ]);

      // Aggregate active project assignments for each supervisor
      const supervisorIds = supervisors.map((s) => s._id);
      const assignmentCounts = await ProjectSupervisorAssignment.aggregate([
        {
          $match: {
            supervisorId: { $in: supervisorIds },
            organizationId: orgId,
            status: 'ACTIVE',
          },
        },
        {
          $group: {
            _id: '$supervisorId',
            count: { $sum: 1 },
          },
        },
      ]);

      const countMap = new Map<string, number>();
      assignmentCounts.forEach((item) => {
        countMap.set(item._id.toString(), item.count);
      });

      const formattedSupervisors = supervisors.map((s: any) => ({
        id: s._id.toString(),
        fullName: s.fullName,
        email: s.email,
        role: s.role,
        organizationId: s.organizationId,
        phone: s.phone || '',
        employeeId: s.employeeId || '',
        isActive: s.isActive,
        assignedProjectsCount: countMap.get(s._id.toString()) || 0,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));

      sendSuccess(
        res,
        {
          supervisors: formattedSupervisors,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
        'Supervisors retrieved successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve supervisors';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/users/supervisors/:id
   * Get supervisor details with assigned projects
   */
  static async getSupervisorById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      const user = await User.findOne({
        _id: id,
        organizationId: orgId,
        role: 'SUPERVISOR',
      });

      if (!user) {
        sendError(res, 'Supervisor not found or unauthorized', 404);
        return;
      }

      // Fetch active project assignments
      const assignments = await ProjectSupervisorAssignment.find({
        supervisorId: user._id,
        organizationId: orgId,
        status: 'ACTIVE',
      })
        .populate('projectId', 'projectName projectCode status priority clientName')
        .lean();

      const assignedProjects = assignments.map((a: any) => ({
        assignmentId: a._id.toString(),
        assignedAt: a.assignedAt,
        status: a.status,
        project: a.projectId
          ? {
              id: a.projectId._id.toString(),
              projectName: a.projectId.projectName,
              projectCode: a.projectId.projectCode,
              status: a.projectId.status,
              priority: a.projectId.priority,
              clientName: a.projectId.clientName,
            }
          : null,
      }));

      sendSuccess(
        res,
        {
          supervisor: user.toSanitized(),
          assignedProjects,
        },
        'Supervisor details retrieved'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve supervisor';
      sendError(res, message, 500);
    }
  }

  /**
   * PATCH /api/users/supervisors/:id
   * Update supervisor profile
   */
  static async updateSupervisor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      const user = await User.findOne({
        _id: id,
        organizationId: orgId,
        role: 'SUPERVISOR',
      });

      if (!user) {
        sendError(res, 'Supervisor not found or unauthorized', 404);
        return;
      }

      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation failed', 400);
        return;
      }

      const { fullName, phone, employeeId } = parsed.data;
      if (fullName) user.fullName = fullName;
      if (phone !== undefined) user.phone = phone;
      if (employeeId !== undefined) user.employeeId = employeeId;

      await user.save();

      sendSuccess(res, user.toSanitized(), 'Supervisor profile updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update supervisor';
      sendError(res, message, 500);
    }
  }

  /**
   * PATCH /api/users/supervisors/:id/status
   * Toggle supervisor active status
   */
  static async toggleSupervisorStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;
      const { isActive } = req.body;

      if (!orgId) {
        sendError(res, 'Organization context missing', 400);
        return;
      }

      if (typeof isActive !== 'boolean') {
        sendError(res, 'isActive boolean is required', 400);
        return;
      }

      const user = await User.findOne({
        _id: id,
        organizationId: orgId,
        role: 'SUPERVISOR',
      });

      if (!user) {
        sendError(res, 'Supervisor not found or unauthorized', 404);
        return;
      }

      // Check seat limit when activating a deactivated supervisor
      if (isActive && !user.isActive) {
        const seatCheck = await EntitlementService.canAddSupervisor(orgId);
        if (!seatCheck.allowed) {
          sendError(res, seatCheck.reason || 'Supervisor seat limit reached for your subscription plan', 403);
          return;
        }
      }

      user.isActive = isActive;
      await user.save();

      sendSuccess(
        res,
        user.toSanitized(),
        `Supervisor account ${isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle status';
      sendError(res, message, 500);
    }
  }

  // =========================================================================
  // INSPECTOR MANAGEMENT (ADMIN ONLY)
  // =========================================================================

  /**
   * POST /api/users/inspectors
   * Create a new inspector account
   */
  static async createInspector(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      if (!orgId) {
        sendError(res, 'Organization context missing', 400);
        return;
      }

      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation failed', 400);
        return;
      }

      const { fullName, email, password, phone, employeeId } = parsed.data;

      // Central Supervisor Seat Entitlement Check
      const seatCheck = await EntitlementService.canAddSupervisor(orgId);
      if (!seatCheck.allowed) {
        sendError(res, seatCheck.reason || 'Supervisor seat limit reached for your subscription plan', 403);
        return;
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        sendError(res, 'An account with this email address already exists', 409);
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({
        fullName,
        email,
        passwordHash,
        role: 'INSPECTOR',
        organizationId: orgId,
        phone: phone || '',
        employeeId: employeeId || '',
        isActive: true,
      });

      await user.save();

      sendSuccess(res, user.toSanitized(), 'Inspector account created successfully', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create inspector';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/users/inspectors
   * List all inspectors for organization with site counts
   */
  static async listInspectors(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      if (!orgId) {
        sendError(res, 'Organization context missing', 400);
        return;
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const skip = (page - 1) * limit;

      const { search, isActive } = req.query;

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(
          res,
          {
            inspectors: [],
            pagination: { total: 0, page, limit, totalPages: 1 },
          },
          'Inspectors retrieved (offline)'
        );
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(
          res,
          {
            supervisors: [],
            pagination: { total: 0, page, limit, totalPages: 1 },
          },
          'Supervisors retrieved (offline)'
        );
        return;
      }

      const filter: Record<string, any> = {
        organizationId: orgId,
        role: 'INSPECTOR',
      };

      if (isActive !== undefined && isActive !== 'ALL') {
        filter.isActive = isActive === 'true';
      }

      if (search && typeof search === 'string' && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ fullName: regex }, { email: regex }, { employeeId: regex }];
      }

      const [total, inspectors] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ]);

      // Aggregate active site assignments for each inspector
      const inspectorIds = inspectors.map((i) => i._id);
      const assignmentCounts = await SiteInspectorAssignment.aggregate([
        {
          $match: {
            inspectorId: { $in: inspectorIds },
            organizationId: orgId,
            status: 'ACTIVE',
          },
        },
        {
          $group: {
            _id: '$inspectorId',
            count: { $sum: 1 },
          },
        },
      ]);

      const countMap = new Map<string, number>();
      assignmentCounts.forEach((item) => {
        countMap.set(item._id.toString(), item.count);
      });

      const formattedInspectors = inspectors.map((i: any) => ({
        id: i._id.toString(),
        fullName: i.fullName,
        email: i.email,
        role: i.role,
        organizationId: i.organizationId,
        phone: i.phone || '',
        employeeId: i.employeeId || '',
        isActive: i.isActive,
        assignedSitesCount: countMap.get(i._id.toString()) || 0,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));

      sendSuccess(
        res,
        {
          inspectors: formattedInspectors,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
        'Inspectors retrieved successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve inspectors';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/users/inspectors/:id
   * Get inspector details with assigned sites
   */
  static async getInspectorById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      const user = await User.findOne({
        _id: id,
        organizationId: orgId,
        role: 'INSPECTOR',
      });

      if (!user) {
        sendError(res, 'Inspector not found or unauthorized', 404);
        return;
      }

      // Fetch active site assignments
      const assignments = await SiteInspectorAssignment.find({
        inspectorId: user._id,
        organizationId: orgId,
        status: 'ACTIVE',
      })
        .populate('siteId', 'siteName siteCode siteType status city address')
        .populate('projectId', 'projectName projectCode')
        .populate('supervisorId', 'fullName email')
        .lean();

      const assignedSites = assignments.map((a: any) => ({
        assignmentId: a._id.toString(),
        assignedAt: a.assignedAt,
        startDate: a.startDate,
        endDate: a.endDate,
        instructions: a.instructions,
        status: a.status,
        site: a.siteId
          ? {
              id: a.siteId._id.toString(),
              siteName: a.siteId.siteName,
              siteCode: a.siteId.siteCode,
              siteType: a.siteId.siteType,
              status: a.siteId.status,
              city: a.siteId.city,
              address: a.siteId.address,
            }
          : null,
        project: a.projectId
          ? {
              id: a.projectId._id.toString(),
              projectName: a.projectId.projectName,
              projectCode: a.projectId.projectCode,
            }
          : null,
        supervisor: a.supervisorId
          ? {
              id: a.supervisorId._id.toString(),
              fullName: a.supervisorId.fullName,
              email: a.supervisorId.email,
            }
          : null,
      }));

      sendSuccess(
        res,
        {
          inspector: user.toSanitized(),
          assignedSites,
        },
        'Inspector details retrieved'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve inspector';
      sendError(res, message, 500);
    }
  }

  /**
   * PATCH /api/users/inspectors/:id
   * Update inspector profile
   */
  static async updateInspector(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      const user = await User.findOne({
        _id: id,
        organizationId: orgId,
        role: 'INSPECTOR',
      });

      if (!user) {
        sendError(res, 'Inspector not found or unauthorized', 404);
        return;
      }

      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation failed', 400);
        return;
      }

      const { fullName, phone, employeeId } = parsed.data;
      if (fullName) user.fullName = fullName;
      if (phone !== undefined) user.phone = phone;
      if (employeeId !== undefined) user.employeeId = employeeId;

      await user.save();

      sendSuccess(res, user.toSanitized(), 'Inspector profile updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update inspector';
      sendError(res, message, 500);
    }
  }

  /**
   * PATCH /api/users/inspectors/:id/status
   * Toggle inspector active status
   */
  static async toggleInspectorStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;
      const { isActive } = req.body;

      if (!orgId) {
        sendError(res, 'Organization context missing', 400);
        return;
      }

      if (typeof isActive !== 'boolean') {
        sendError(res, 'isActive boolean is required', 400);
        return;
      }

      const user = await User.findOne({
        _id: id,
        organizationId: orgId,
        role: 'INSPECTOR',
      });

      if (!user) {
        sendError(res, 'Inspector not found or unauthorized', 404);
        return;
      }

      user.isActive = isActive;
      await user.save();

      sendSuccess(
        res,
        user.toSanitized(),
        `Inspector account ${isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle status';
      sendError(res, message, 500);
    }
  }
}
