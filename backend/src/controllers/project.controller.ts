import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { Project } from '../models/project.model.js';
import { Site } from '../models/site.model.js';
import { User } from '../models/user.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class ProjectController {
  /**
   * GET /api/projects
   * List projects with search, filtering, and pagination
   */
  static async listProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      if (!orgId) {
        sendError(res, 'User organization context missing', 400);
        return;
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const skip = (page - 1) * limit;

      const { search, status, priority, isArchived } = req.query;

      const filter: Record<string, any> = {
        organizationId: orgId,
        isArchived: isArchived === 'true' ? true : false,
      };

      if (status && typeof status === 'string') {
        filter.status = status;
      }

      if (priority && typeof priority === 'string') {
        filter.priority = priority;
      }

      if (search && typeof search === 'string' && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ projectName: regex }, { projectCode: regex }, { clientName: regex }];
      }

      const [total, projects] = await Promise.all([
        Project.countDocuments(filter),
        Project.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('assignedSupervisors', 'fullName email role')
          .lean(),
      ]);

      // Count associated sites for each project
      const projectIds = projects.map((p) => p._id);
      const siteCounts = await Site.aggregate([
        { $match: { projectId: { $in: projectIds }, isArchived: false } },
        { $group: { _id: '$projectId', count: { $sum: 1 } } },
      ]);

      const countMap = new Map<string, number>();
      siteCounts.forEach((item) => {
        countMap.set(item._id.toString(), item.count);
      });

      const formattedProjects = projects.map((p: any) => ({
        id: p._id.toString(),
        ...p,
        _id: undefined,
        siteCount: countMap.get(p._id.toString()) || 0,
      }));

      sendSuccess(
        res,
        {
          projects: formattedProjects,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
        'Projects retrieved successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve projects';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/projects/:id
   * Get single project details with associated sites
   */
  static async getProjectById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      const project = await Project.findOne({
        _id: id,
        organizationId: orgId,
      }).populate('assignedSupervisors', 'fullName email role id');

      if (!project) {
        sendError(res, 'Project not found or unauthorized', 404);
        return;
      }

      const sites = await Site.find({
        projectId: project._id,
        organizationId: orgId,
        isArchived: false,
      }).sort({ createdAt: -1 });

      sendSuccess(
        res,
        {
          project: project.toJSON(),
          sites: sites.map((s) => s.toJSON()),
        },
        'Project details retrieved successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve project';
      sendError(res, message, 500);
    }
  }

  /**
   * POST /api/projects
   * Create new project
   */
  static async createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;

      if (!orgId || !userId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      const { projectCode } = req.body;

      // Check unique code within organization
      const existing = await Project.findOne({
        organizationId: orgId,
        projectCode: projectCode.toUpperCase(),
      });

      if (existing) {
        sendError(res, `Project code '${projectCode.toUpperCase()}' already exists in your organization`, 409);
        return;
      }

      const project = await Project.create({
        ...req.body,
        projectCode: projectCode.toUpperCase(),
        organizationId: orgId,
        createdBy: userId,
      });

      sendSuccess(res, project.toJSON(), 'Project created successfully', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project';
      sendError(res, message, 500);
    }
  }

  /**
   * PUT /api/projects/:id
   * Update project details
   */
  static async updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      const project = await Project.findOne({
        _id: id,
        organizationId: orgId,
      });

      if (!project) {
        sendError(res, 'Project not found or unauthorized', 404);
        return;
      }

      // Update allowed fields
      const {
        projectName,
        description,
        industry,
        clientName,
        projectManager,
        startDate,
        expectedEndDate,
        actualEndDate,
        status,
        priority,
        location,
      } = req.body;

      if (projectName) project.projectName = projectName;
      if (description !== undefined) project.description = description;
      if (industry !== undefined) project.industry = industry;
      if (clientName !== undefined) project.clientName = clientName;
      if (projectManager !== undefined) project.projectManager = projectManager;
      if (startDate) project.startDate = new Date(startDate);
      if (expectedEndDate) project.expectedEndDate = new Date(expectedEndDate);
      if (actualEndDate !== undefined) {
        project.actualEndDate = actualEndDate ? new Date(actualEndDate) : undefined;
      }
      if (status) project.status = status;
      if (priority) project.priority = priority;
      if (location !== undefined) project.location = location;

      await project.save();

      sendSuccess(res, project.toJSON(), 'Project updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update project';
      sendError(res, message, 500);
    }
  }

  /**
   * PATCH /api/projects/:id/archive
   * Safe archive project with dependent site check
   */
  static async archiveProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;
      const force = req.query.force === 'true';

      const project = await Project.findOne({
        _id: id,
        organizationId: orgId,
      });

      if (!project) {
        sendError(res, 'Project not found or unauthorized', 404);
        return;
      }

      // Check dependent active sites
      const activeSitesCount = await Site.countDocuments({
        projectId: project._id,
        organizationId: orgId,
        isArchived: false,
        status: 'ACTIVE',
      });

      if (activeSitesCount > 0 && !force) {
        sendError(
          res,
          `Cannot archive project: ${activeSitesCount} active site(s) are currently attached to this project. Please set site statuses to inactive or pass confirmation.`,
          400,
          {
            activeSites: [`${activeSitesCount} active sites attached`],
          }
        );
        return;
      }

      project.isArchived = true;
      await project.save();

      sendSuccess(res, project.toJSON(), 'Project archived successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to archive project';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/projects/:id/supervisors
   * Get assigned and available supervisors for a project
   */
  static async getProjectSupervisors(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      const project = await Project.findOne({
        _id: id,
        organizationId: orgId,
      }).populate('assignedSupervisors', 'fullName email role id');

      if (!project) {
        sendError(res, 'Project not found or unauthorized', 404);
        return;
      }

      // Fetch all supervisors in organization
      const allSupervisors = await User.find({
        organizationId: orgId,
        role: 'SUPERVISOR',
        isActive: true,
      }).select('fullName email role _id');

      const assignedIds = new Set(
        project.assignedSupervisors.map((s: any) => s._id?.toString() || s.id?.toString())
      );

      const availableSupervisors = allSupervisors
        .filter((s) => !assignedIds.has(s._id.toString()))
        .map((s) => ({
          id: s._id.toString(),
          fullName: s.fullName,
          email: s.email,
          role: s.role,
        }));

      sendSuccess(
        res,
        {
          assigned: project.assignedSupervisors,
          available: availableSupervisors,
        },
        'Supervisors list retrieved'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve supervisors';
      sendError(res, message, 500);
    }
  }

  /**
   * PUT /api/projects/:id/supervisors
   * Update supervisor assignments for a project
   */
  static async assignSupervisors(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;
      const { supervisorIds } = req.body;

      const project = await Project.findOne({
        _id: id,
        organizationId: orgId,
      });

      if (!project) {
        sendError(res, 'Project not found or unauthorized', 404);
        return;
      }

      // Validate all IDs belong to organization and are SUPERVISOR
      if (supervisorIds && supervisorIds.length > 0) {
        const validSupervisors = await User.find({
          _id: { $in: supervisorIds },
          organizationId: orgId,
          role: 'SUPERVISOR',
          isActive: true,
        });

        if (validSupervisors.length !== supervisorIds.length) {
          sendError(res, 'One or more selected supervisors are invalid or inactive', 400);
          return;
        }
      }

      project.assignedSupervisors = supervisorIds as any;
      await project.save();

      const updatedProject = await Project.findById(project._id).populate(
        'assignedSupervisors',
        'fullName email role id'
      );

      sendSuccess(res, updatedProject?.toJSON(), 'Supervisor assignments updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign supervisors';
      sendError(res, message, 500);
    }
  }
}
