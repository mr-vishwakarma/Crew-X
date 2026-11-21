import { Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { Project } from '../models/project.model.js';
import { Site } from '../models/site.model.js';
import { User } from '../models/user.model.js';
import { Inspection } from '../models/inspection.model.js';
import {
  ProjectSupervisorAssignment,
  SiteInspectorAssignment,
} from '../models/assignment.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

const assignSupervisorsSchema = z.object({
  supervisorIds: z.array(z.string().min(1)),
});

const assignInspectorSchema = z.object({
  inspectorId: z.string().min(1, 'Inspector ID is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  instructions: z.string().trim().optional(),
});

export class AssignmentController {
  // =========================================================================
  // ADMINISTRATOR: PROJECT-SUPERVISOR ASSIGNMENTS
  // =========================================================================

  /**
   * PUT /api/assignments/projects/:projectId/supervisors
   * Assign/unassign supervisors to a project (Admin only)
   */
  static async assignSupervisorsToProject(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const adminId = req.user?.userId;
      const { projectId } = req.params;

      if (!orgId || !adminId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      const parsed = assignSupervisorsSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Invalid supervisor IDs', 400);
        return;
      }

      const { supervisorIds } = parsed.data;

      const project = await Project.findOne({
        _id: projectId,
        organizationId: orgId,
        isArchived: false,
      });

      if (!project) {
        sendError(res, 'Project not found or archived', 404);
        return;
      }

      // Validate all provided supervisors are active and belong to org
      if (supervisorIds.length > 0) {
        const validSupervisors = await User.find({
          _id: { $in: supervisorIds },
          organizationId: orgId,
          role: 'SUPERVISOR',
          isActive: true,
        });

        if (validSupervisors.length !== supervisorIds.length) {
          sendError(res, 'One or more supervisors are invalid, inactive, or not in your organization', 400);
          return;
        }
      }

      // Existing active assignments
      const existingAssignments = await ProjectSupervisorAssignment.find({
        projectId: project._id,
        organizationId: orgId,
        status: 'ACTIVE',
      });

      const existingSupervisorIdSet = new Set(
        existingAssignments.map((a) => a.supervisorId.toString())
      );
      const newSupervisorIdSet = new Set(supervisorIds);

      const now = new Date();

      // Revoke removed supervisors
      const toRevoke = existingAssignments.filter(
        (a) => !newSupervisorIdSet.has(a.supervisorId.toString())
      );
      for (const assignment of toRevoke) {
        assignment.status = 'REVOKED';
        assignment.revokedAt = now;
        assignment.revokedBy = adminId;
        await assignment.save();
      }

      // Create new active assignments
      const toAdd = supervisorIds.filter((id) => !existingSupervisorIdSet.has(id));
      for (const supId of toAdd) {
        await ProjectSupervisorAssignment.create({
          organizationId: orgId,
          projectId: project._id,
          supervisorId: new Types.ObjectId(supId),
          assignedBy: adminId,
          assignedAt: now,
          status: 'ACTIVE',
        });
      }

      // Sync project document array
      project.assignedSupervisors = supervisorIds.map((id) => new Types.ObjectId(id));
      await project.save();

      // Return refreshed assignments
      const updatedAssignments = await ProjectSupervisorAssignment.find({
        projectId: project._id,
        organizationId: orgId,
        status: 'ACTIVE',
      }).populate('supervisorId', 'fullName email employeeId phone isActive');

      sendSuccess(
        res,
        {
          projectId: project._id.toString(),
          projectName: project.projectName,
          assignedSupervisors: updatedAssignments.map((a: any) => ({
            assignmentId: a._id.toString(),
            supervisor: a.supervisorId
              ? {
                  id: a.supervisorId._id.toString(),
                  fullName: a.supervisorId.fullName,
                  email: a.supervisorId.email,
                  employeeId: a.supervisorId.employeeId,
                  phone: a.supervisorId.phone,
                }
              : null,
            assignedAt: a.assignedAt,
            status: a.status,
          })),
        },
        'Project supervisor assignments updated successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign supervisors';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/assignments/projects/:projectId/supervisors
   * Retrieve active assigned and available supervisors for a project
   */
  static async getProjectSupervisors(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { projectId } = req.params;

      const project = await Project.findOne({
        _id: projectId,
        organizationId: orgId,
      });

      if (!project) {
        sendError(res, 'Project not found', 404);
        return;
      }

      // Active assignments
      const activeAssignments = await ProjectSupervisorAssignment.find({
        projectId: project._id,
        organizationId: orgId,
        status: 'ACTIVE',
      }).populate('supervisorId', 'fullName email employeeId phone isActive');

      const assignedSupervisorIds = new Set(
        activeAssignments.map((a: any) => a.supervisorId?._id?.toString() || a.supervisorId?.toString())
      );

      // Available active supervisors in organization
      const allSupervisors = await User.find({
        organizationId: orgId,
        role: 'SUPERVISOR',
        isActive: true,
      }).select('fullName email employeeId phone isActive');

      const availableSupervisors = allSupervisors
        .filter((s) => !assignedSupervisorIds.has(s._id.toString()))
        .map((s) => ({
          id: s._id.toString(),
          fullName: s.fullName,
          email: s.email,
          employeeId: s.employeeId,
          phone: s.phone,
        }));

      sendSuccess(
        res,
        {
          assigned: activeAssignments.map((a: any) => ({
            assignmentId: a._id.toString(),
            supervisor: a.supervisorId
              ? {
                  id: a.supervisorId._id.toString(),
                  fullName: a.supervisorId.fullName,
                  email: a.supervisorId.email,
                  employeeId: a.supervisorId.employeeId,
                  phone: a.supervisorId.phone,
                }
              : null,
            assignedAt: a.assignedAt,
            status: a.status,
          })),
          available: availableSupervisors,
        },
        'Project supervisors retrieved'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get supervisors';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/assignments/admin/overview
   * Complete organization assignments matrix (Admin only)
   */
  static async getAdminAssignmentsOverview(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      if (!orgId) {
        sendError(res, 'Organization context missing', 400);
        return;
      }

      // Fetch all active projects
      const projects = await Project.find({
        organizationId: orgId,
        isArchived: false,
      })
        .sort({ createdAt: -1 })
        .populate('assignedSupervisors', 'fullName email employeeId')
        .lean();

      // Fetch all active sites
      const sites = await Site.find({
        organizationId: orgId,
        isArchived: false,
      }).lean();

      // Fetch all active site inspector assignments
      const siteAssignments = await SiteInspectorAssignment.find({
        organizationId: orgId,
        status: 'ACTIVE',
      })
        .populate('inspectorId', 'fullName email employeeId')
        .populate('supervisorId', 'fullName email')
        .lean();

      const siteAssignmentMap = new Map<string, any[]>();
      siteAssignments.forEach((sa) => {
        const sId = sa.siteId.toString();
        if (!siteAssignmentMap.has(sId)) {
          siteAssignmentMap.set(sId, []);
        }
        siteAssignmentMap.get(sId)?.push({
          assignmentId: sa._id.toString(),
          inspector: sa.inspectorId,
          supervisor: sa.supervisorId,
          assignedAt: sa.assignedAt,
        });
      });

      const matrix = projects.map((p: any) => {
        const projectSites = sites.filter((s) => s.projectId.toString() === p._id.toString());
        return {
          id: p._id.toString(),
          projectName: p.projectName,
          projectCode: p.projectCode,
          status: p.status,
          supervisors: p.assignedSupervisors || [],
          sites: projectSites.map((s) => ({
            id: s._id.toString(),
            siteName: s.siteName,
            siteCode: s.siteCode,
            status: s.status,
            assignedInspectors: siteAssignmentMap.get(s._id.toString()) || [],
          })),
        };
      });

      const totalProjects = projects.length;
      const projectsWithSupervisors = projects.filter(
        (p: any) => p.assignedSupervisors && p.assignedSupervisors.length > 0
      ).length;
      const totalSites = sites.length;
      const sitesWithInspectors = sites.filter(
        (s) => (siteAssignmentMap.get(s._id.toString())?.length || 0) > 0
      ).length;

      sendSuccess(
        res,
        {
          matrix,
          stats: {
            totalProjects,
            projectsWithSupervisors,
            projectsWithoutSupervisors: totalProjects - projectsWithSupervisors,
            totalSites,
            sitesWithInspectors,
            sitesWithoutInspectors: totalSites - sitesWithInspectors,
            activeSiteAssignmentsCount: siteAssignments.length,
          },
        },
        'Assignments overview retrieved'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get overview';
      sendError(res, message, 500);
    }
  }

  // =========================================================================
  // SUPERVISOR: PROJECT AND SITE ACCESS
  // =========================================================================

  /**
   * Helper: verify supervisor authority over a project
   */
  private static async verifySupervisorProjectAuthority(
    userId: string,
    role: string,
    orgId: string,
    projectId: string | Types.ObjectId
  ): Promise<boolean> {
    if (role === 'ADMIN') return true;
    if (role !== 'SUPERVISOR') return false;

    // Check ProjectSupervisorAssignment
    const activeAssignment = await ProjectSupervisorAssignment.findOne({
      organizationId: orgId,
      projectId,
      supervisorId: userId,
      status: 'ACTIVE',
    });

    if (activeAssignment) return true;

    // Fallback: check project.assignedSupervisors array
    const proj = await Project.findOne({
      _id: projectId,
      organizationId: orgId,
      assignedSupervisors: new Types.ObjectId(userId),
    });

    return !!proj;
  }

  /**
   * GET /api/supervisor/projects
   * List only projects assigned to the authenticated supervisor
   */
  static async getSupervisorProjects(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!orgId || !userId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      let projects: any[] = [];

      if (role === 'ADMIN') {
        // Admin can view all projects
        projects = await Project.find({
          organizationId: orgId,
          isArchived: false,
        })
          .sort({ createdAt: -1 })
          .populate('assignedSupervisors', 'fullName email')
          .lean();
      } else {
        // Find project IDs assigned to this supervisor
        const assignments = await ProjectSupervisorAssignment.find({
          organizationId: orgId,
          supervisorId: userId,
          status: 'ACTIVE',
        }).select('projectId');

        const assignedProjectIds = assignments.map((a) => a.projectId);

        // Also check Project.assignedSupervisors directly
        const projectsWithSupervisor = await Project.find({
          organizationId: orgId,
          isArchived: false,
          $or: [
            { _id: { $in: assignedProjectIds } },
            { assignedSupervisors: new Types.ObjectId(userId) },
          ],
        })
          .sort({ createdAt: -1 })
          .populate('assignedSupervisors', 'fullName email')
          .lean();

        projects = projectsWithSupervisor;
      }

      // Count sites and active inspectors for each project
      const projectIds = projects.map((p) => p._id);

      const [siteCounts, inspectorCounts] = await Promise.all([
        Site.aggregate([
          { $match: { projectId: { $in: projectIds }, isArchived: false } },
          { $group: { _id: '$projectId', count: { $sum: 1 } } },
        ]),
        SiteInspectorAssignment.aggregate([
          { $match: { projectId: { $in: projectIds }, status: 'ACTIVE' } },
          { $group: { _id: '$projectId', count: { $sum: 1 } } },
        ]),
      ]);

      const siteCountMap = new Map<string, number>();
      siteCounts.forEach((sc) => siteCountMap.set(sc._id.toString(), sc.count));

      const inspectorCountMap = new Map<string, number>();
      inspectorCounts.forEach((ic) => inspectorCountMap.set(ic._id.toString(), ic.count));

      const formattedProjects = projects.map((p: any) => ({
        id: p._id.toString(),
        projectName: p.projectName,
        projectCode: p.projectCode,
        description: p.description,
        industry: p.industry,
        clientName: p.clientName,
        startDate: p.startDate,
        expectedEndDate: p.expectedEndDate,
        status: p.status,
        priority: p.priority,
        location: p.location,
        sitesCount: siteCountMap.get(p._id.toString()) || 0,
        activeInspectorsCount: inspectorCountMap.get(p._id.toString()) || 0,
        supervisors: p.assignedSupervisors || [],
        createdAt: p.createdAt,
      }));

      sendSuccess(res, formattedProjects, 'Supervisor projects retrieved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve projects';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/supervisor/sites
   * List sites under projects assigned to the supervisor
   */
  static async getSupervisorSites(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;
      const role = req.user?.role;
      const { projectId } = req.query;

      if (!orgId || !userId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      let authorizedProjectIds: Types.ObjectId[] = [];

      if (role === 'ADMIN') {
        const allProjects = await Project.find({ organizationId: orgId, isArchived: false }).select('_id');
        authorizedProjectIds = allProjects.map((p) => p._id);
      } else {
        const assignments = await ProjectSupervisorAssignment.find({
          organizationId: orgId,
          supervisorId: userId,
          status: 'ACTIVE',
        }).select('projectId');

        const fromProj = await Project.find({
          organizationId: orgId,
          assignedSupervisors: new Types.ObjectId(userId),
        }).select('_id');

        const set = new Set<string>();
        assignments.forEach((a) => set.add(a.projectId.toString()));
        fromProj.forEach((p) => set.add(p._id.toString()));

        authorizedProjectIds = Array.from(set).map((id) => new Types.ObjectId(id));
      }

      // If specific projectId requested, ensure supervisor is authorized
      if (projectId && typeof projectId === 'string') {
        const hasAuth = authorizedProjectIds.some((pId) => pId.toString() === projectId);
        if (!hasAuth) {
          sendError(res, 'Unauthorized: you are not assigned to this project', 403);
          return;
        }
        authorizedProjectIds = [new Types.ObjectId(projectId)];
      }

      if (authorizedProjectIds.length === 0) {
        sendSuccess(res, [], 'No sites found for authorized projects');
        return;
      }

      const sites = await Site.find({
        organizationId: orgId,
        projectId: { $in: authorizedProjectIds },
        isArchived: false,
      })
        .populate('projectId', 'projectName projectCode')
        .sort({ createdAt: -1 })
        .lean();

      // Get assigned inspectors for each site
      const siteIds = sites.map((s) => s._id);
      const activeAssignments = await SiteInspectorAssignment.find({
        siteId: { $in: siteIds },
        organizationId: orgId,
        status: 'ACTIVE',
      })
        .populate('inspectorId', 'fullName email employeeId phone')
        .populate('supervisorId', 'fullName email')
        .lean();

      const assignmentMap = new Map<string, any[]>();
      activeAssignments.forEach((a) => {
        const sId = a.siteId.toString();
        if (!assignmentMap.has(sId)) assignmentMap.set(sId, []);
        assignmentMap.get(sId)?.push({
          assignmentId: a._id.toString(),
          assignedAt: a.assignedAt,
          startDate: a.startDate,
          endDate: a.endDate,
          instructions: a.instructions,
          status: a.status,
          inspector: a.inspectorId
            ? {
                id: (a.inspectorId as any)._id?.toString() || (a.inspectorId as any).id,
                fullName: (a.inspectorId as any).fullName,
                email: (a.inspectorId as any).email,
                employeeId: (a.inspectorId as any).employeeId,
                phone: (a.inspectorId as any).phone,
              }
            : null,
          assignedBySupervisor: a.supervisorId
            ? {
                fullName: (a.supervisorId as any).fullName,
                email: (a.supervisorId as any).email,
              }
            : null,
        });
      });

      const formattedSites = sites.map((s: any) => ({
        id: s._id.toString(),
        siteName: s.siteName,
        siteCode: s.siteCode,
        siteType: s.siteType,
        address: s.address,
        city: s.city,
        state: s.state,
        status: s.status,
        project: s.projectId
          ? {
              id: s.projectId._id.toString(),
              projectName: s.projectId.projectName,
              projectCode: s.projectId.projectCode,
            }
          : null,
        assignedInspectors: assignmentMap.get(s._id.toString()) || [],
        assignedInspectorsCount: (assignmentMap.get(s._id.toString()) || []).length,
        createdAt: s.createdAt,
      }));

      sendSuccess(res, formattedSites, 'Supervisor sites retrieved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve sites';
      sendError(res, message, 500);
    }
  }

  // =========================================================================
  // SUPERVISOR: SITE-INSPECTOR ASSIGNMENTS
  // =========================================================================

  /**
   * GET /api/assignments/sites/:siteId/inspectors
   * Retrieve active assigned inspectors, history, and available inspectors
   */
  static async getSiteInspectors(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;
      const role = req.user?.role;
      const { siteId } = req.params;

      if (!orgId || !userId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      const site = await Site.findOne({
        _id: siteId,
        organizationId: orgId,
      }).populate('projectId', 'projectName projectCode');

      if (!site) {
        sendError(res, 'Site not found', 404);
        return;
      }

      // Check supervisor authority over this site's project
      const hasAuthority = await AssignmentController.verifySupervisorProjectAuthority(
        userId,
        role || 'SUPERVISOR',
        orgId,
        site.projectId._id || site.projectId
      );

      if (!hasAuthority) {
        sendError(res, 'Unauthorized: You are not assigned to the project containing this site', 403);
        return;
      }

      // All assignments on this site (active + revoked)
      const allAssignments = await SiteInspectorAssignment.find({
        siteId: site._id,
        organizationId: orgId,
      })
        .populate('inspectorId', 'fullName email employeeId phone isActive')
        .populate('supervisorId', 'fullName email')
        .sort({ assignedAt: -1 })
        .lean();

      const activeAssignments = allAssignments.filter((a) => a.status === 'ACTIVE');
      const historyAssignments = allAssignments.filter((a) => a.status !== 'ACTIVE');

      const activeInspectorIds = new Set(
        activeAssignments.map((a: any) =>
          a.inspectorId?._id?.toString() || a.inspectorId?.toString()
        )
      );

      // Available active inspectors in organization
      const allInspectors = await User.find({
        organizationId: orgId,
        role: 'INSPECTOR',
        isActive: true,
      })
        .select('fullName email employeeId phone isActive')
        .sort({ fullName: 1 })
        .lean();

      const availableInspectors = allInspectors
        .filter((i) => !activeInspectorIds.has(i._id.toString()))
        .map((i: any) => ({
          id: i._id.toString(),
          fullName: i.fullName,
          email: i.email,
          employeeId: i.employeeId,
          phone: i.phone,
        }));

      sendSuccess(
        res,
        {
          site: {
            id: site._id.toString(),
            siteName: site.siteName,
            siteCode: site.siteCode,
            status: site.status,
            project: site.projectId,
          },
          assigned: activeAssignments.map((a: any) => ({
            assignmentId: a._id.toString(),
            assignedAt: a.assignedAt,
            startDate: a.startDate,
            endDate: a.endDate,
            instructions: a.instructions,
            status: a.status,
            inspector: a.inspectorId
              ? {
                  id: a.inspectorId._id.toString(),
                  fullName: a.inspectorId.fullName,
                  email: a.inspectorId.email,
                  employeeId: a.inspectorId.employeeId,
                  phone: a.inspectorId.phone,
                }
              : null,
            assignedBy: a.supervisorId
              ? {
                  fullName: a.supervisorId.fullName,
                  email: a.supervisorId.email,
                }
              : null,
          })),
          history: historyAssignments.map((a: any) => ({
            assignmentId: a._id.toString(),
            assignedAt: a.assignedAt,
            revokedAt: a.revokedAt,
            status: a.status,
            inspector: a.inspectorId
              ? {
                  id: a.inspectorId._id.toString(),
                  fullName: a.inspectorId.fullName,
                  email: a.inspectorId.email,
                }
              : null,
          })),
          available: availableInspectors,
        },
        'Site inspector assignments retrieved'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve site inspectors';
      sendError(res, message, 500);
    }
  }

  /**
   * POST /api/assignments/sites/:siteId/inspectors
   * Assign an inspector to a site (Supervisor or Admin)
   */
  static async assignInspectorToSite(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const supervisorId = req.user?.userId;
      const role = req.user?.role;
      const { siteId } = req.params;

      if (!orgId || !supervisorId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      const parsed = assignInspectorSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Invalid assignment data', 400);
        return;
      }

      const { inspectorId, startDate, endDate, instructions } = parsed.data;

      const site = await Site.findOne({
        _id: siteId,
        organizationId: orgId,
        isArchived: false,
      });

      if (!site) {
        sendError(res, 'Site not found or archived', 404);
        return;
      }

      // Authorization rule: Supervisor must be assigned to the project containing this site
      const hasAuthority = await AssignmentController.verifySupervisorProjectAuthority(
        supervisorId,
        role || 'SUPERVISOR',
        orgId,
        site.projectId
      );

      if (!hasAuthority) {
        sendError(
          res,
          'Unauthorized: You are not assigned to the project containing this site and cannot assign inspectors',
          403
        );
        return;
      }

      // Authorization rule: Inspector must belong to the same organization and be active
      const inspector = await User.findOne({
        _id: inspectorId,
        organizationId: orgId,
        role: 'INSPECTOR',
        isActive: true,
      });

      if (!inspector) {
        sendError(res, 'Inspector not found, inactive, or not in your organization', 400);
        return;
      }

      // Check for duplicate active assignment
      const existingActive = await SiteInspectorAssignment.findOne({
        siteId: site._id,
        inspectorId: inspector._id,
        status: 'ACTIVE',
      });

      if (existingActive) {
        sendError(res, 'This inspector is already actively assigned to this site', 409);
        return;
      }

      const assignment = await SiteInspectorAssignment.create({
        organizationId: orgId,
        projectId: site.projectId,
        siteId: site._id,
        inspectorId: inspector._id,
        supervisorId: new Types.ObjectId(supervisorId),
        assignedBy: supervisorId,
        assignedAt: new Date(),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        instructions: instructions || '',
        status: 'ACTIVE',
      });

      const populated = await SiteInspectorAssignment.findById(assignment._id)
        .populate('inspectorId', 'fullName email employeeId phone')
        .populate('supervisorId', 'fullName email')
        .populate('siteId', 'siteName siteCode')
        .populate('projectId', 'projectName projectCode');

      sendSuccess(res, populated, 'Inspector assigned to site successfully', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign inspector';
      sendError(res, message, 500);
    }
  }

  /**
   * PATCH /api/assignments/sites/:siteId/inspectors/:assignmentId/revoke
   * Revoke an inspector's assignment to a site
   */
  static async revokeInspectorFromSite(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const supervisorId = req.user?.userId;
      const role = req.user?.role;
      const { siteId, assignmentId } = req.params;

      if (!orgId || !supervisorId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      const site = await Site.findOne({
        _id: siteId,
        organizationId: orgId,
      });

      if (!site) {
        sendError(res, 'Site not found', 404);
        return;
      }

      const hasAuthority = await AssignmentController.verifySupervisorProjectAuthority(
        supervisorId,
        role || 'SUPERVISOR',
        orgId,
        site.projectId
      );

      if (!hasAuthority) {
        sendError(res, 'Unauthorized: You are not assigned to this project', 403);
        return;
      }

      const assignment = await SiteInspectorAssignment.findOne({
        _id: assignmentId,
        siteId: site._id,
        organizationId: orgId,
        status: 'ACTIVE',
      });

      if (!assignment) {
        sendError(res, 'Active assignment not found or already revoked', 404);
        return;
      }

      assignment.status = 'REVOKED';
      assignment.revokedAt = new Date();
      assignment.revokedBy = supervisorId;
      await assignment.save();

      sendSuccess(
        res,
        {
          assignmentId: assignment._id.toString(),
          status: 'REVOKED',
          revokedAt: assignment.revokedAt,
        },
        'Inspector assignment revoked successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to revoke assignment';
      sendError(res, message, 500);
    }
  }

  // =========================================================================
  // INSPECTOR: MY SITES AND MY ASSIGNMENTS
  // =========================================================================

  /**
   * GET /api/inspector/my-sites
   * List only sites where the authenticated inspector is actively assigned
   */
  static async getInspectorMySites(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const inspectorId = req.user?.userId;

      if (!orgId || !inspectorId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, [], 'Inspector active sites retrieved (no active DB)');
        return;
      }

      // Query active assignments for this inspector
      const activeAssignments = await SiteInspectorAssignment.find({
        organizationId: orgId,
        inspectorId: new Types.ObjectId(inspectorId),
        status: 'ACTIVE',
      })
        .populate('siteId')
        .populate('projectId', 'projectName projectCode clientName')
        .populate('supervisorId', 'fullName email')
        .sort({ assignedAt: -1 })
        .lean();

      // Filter out any archived sites
      const validSites = activeAssignments
        .filter((a: any) => a.siteId && !a.siteId.isArchived)
        .map((a: any) => ({
          assignmentId: a._id.toString(),
          assignedAt: a.assignedAt,
          startDate: a.startDate,
          endDate: a.endDate,
          instructions: a.instructions,
          status: a.status,
          site: {
            id: a.siteId._id.toString(),
            siteName: a.siteId.siteName,
            siteCode: a.siteId.siteCode,
            siteType: a.siteId.siteType,
            address: a.siteId.address,
            city: a.siteId.city,
            state: a.siteId.state,
            status: a.siteId.status,
            latitude: a.siteId.latitude,
            longitude: a.siteId.longitude,
          },
          project: a.projectId
            ? {
                id: a.projectId._id.toString(),
                projectName: a.projectId.projectName,
                projectCode: a.projectId.projectCode,
                clientName: a.projectId.clientName,
              }
            : null,
          assigningSupervisor: a.supervisorId
            ? {
                id: a.supervisorId._id.toString(),
                fullName: a.supervisorId.fullName,
                email: a.supervisorId.email,
              }
            : null,
        }));

      sendSuccess(res, validSites, 'Inspector active sites retrieved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve inspector sites';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/inspector/my-assignments
   * List real inspection assignments assigned to the inspector
   */
  static async getInspectorMyAssignments(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const inspectorId = req.user?.userId;

      if (!orgId || !inspectorId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      const inspections = await Inspection.find({
        organizationId: orgId,
        inspectorId: new Types.ObjectId(inspectorId),
      })
        .populate('projectId', 'projectName projectCode')
        .populate('siteId', 'siteName siteCode address city')
        .sort({ dueDate: 1, createdAt: -1 })
        .lean();

      const formatted = inspections.map((i: any) => ({
        id: i._id.toString(),
        code: i.inspectionCode || `INS-${i._id.toString().slice(-6).toUpperCase()}`,
        title: i.title || 'Field Compliance Audit',
        projectName: i.projectId?.projectName || 'Project',
        siteName: i.siteId?.siteName || 'Site',
        location: i.siteId?.city || 'Field',
        checklistType: i.checklistTemplateId?.toString() || 'General Safety Checklist',
        priority: i.priority || 'MEDIUM',
        dueDate: i.dueDate ? new Date(i.dueDate).toISOString() : new Date().toISOString(),
        status: i.status || 'ASSIGNED',
        isOfflineReady: true,
        instructions: i.notes || '',
      }));

      sendSuccess(res, formatted, 'Inspector assignments retrieved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve inspections';
      sendError(res, message, 500);
    }
  }
}
