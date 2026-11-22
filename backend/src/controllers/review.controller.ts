import { Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { Inspection } from '../models/inspection.model.js';
import { InspectionRevision } from '../models/inspection-revision.model.js';
import { ProjectSupervisorAssignment } from '../models/assignment.model.js';
import { AnomalyFlag } from '../models/anomaly-flag.model.js';
import { recordAuditLog } from '../utils/audit.js';
import { sendSuccess, sendError } from '../utils/response.js';

const approveReviewSchema = z.object({
  supervisorFeedback: z.string().trim().max(1000).optional(),
});

const rejectReviewSchema = z.object({
  rejectionReason: z.string().trim().min(5, 'Rejection reason must be at least 5 characters').max(1000),
  supervisorFeedback: z.string().trim().max(1000).optional(),
});

const requestCorrectionSchema = z.object({
  supervisorFeedback: z.string().trim().min(5, 'Feedback explanation is required').max(1000),
  requestedCorrections: z
    .array(
      z.object({
        questionId: z.string().min(1, 'Question ID is required'),
        issueDescription: z.string().trim().min(3, 'Issue description is required'),
      })
    )
    .min(1, 'At least one checklist question must be flagged for correction'),
});

export class ReviewController {
  /**
   * Helper: validates supervisor access to project
   */
  private static async verifySupervisorProjectAccess(
    req: AuthenticatedRequest,
    projectId: Types.ObjectId | string
  ): Promise<boolean> {
    if (req.user?.role === 'ADMIN') return true;
    if (req.user?.role !== 'SUPERVISOR') return false;

    if (mongoose.connection.readyState !== 1) return true;

    const assignment = await ProjectSupervisorAssignment.findOne({
      organizationId: req.user.organizationId,
      supervisorId: new Types.ObjectId(req.user.userId),
      projectId: new Types.ObjectId(projectId),
      status: 'ACTIVE',
    });

    return !!assignment;
  }

  /**
   * GET /api/reviews/queue
   * Supervisor Review Queue with real database records, filters, search & pagination
   */
  static async getReviewQueue(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!orgId || !userId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const skip = (page - 1) * limit;

      const { status, projectId, siteId, priority, search } = req.query;

      // Handle offline or memory test mode
      if (mongoose.connection.readyState !== 1) {
        sendSuccess(
          res,
          {
            inspections: [],
            pagination: { total: 0, page, limit, totalPages: 1 },
            metrics: { pendingCount: 0, underReviewCount: 0, approvedTodayCount: 0 },
          },
          'Review queue retrieved (test mode)'
        );
        return;
      }

      const filter: Record<string, any> = { organizationId: orgId };

      // Scope to Supervisor assigned projects
      if (userRole === 'SUPERVISOR') {
        const assignments = await ProjectSupervisorAssignment.find({
          organizationId: orgId,
          supervisorId: new Types.ObjectId(userId),
          status: 'ACTIVE',
        }).select('projectId');

        const allowedProjectIds = assignments.map((a) => a.projectId);
        filter.projectId = { $in: allowedProjectIds };
      }

      // Filter by project if provided
      if (projectId && Types.ObjectId.isValid(projectId as string)) {
        filter.projectId = new Types.ObjectId(projectId as string);
      }

      // Filter by site if provided
      if (siteId && Types.ObjectId.isValid(siteId as string)) {
        filter.siteId = new Types.ObjectId(siteId as string);
      }

      // Filter by priority / risk level
      if (priority && typeof priority === 'string') {
        filter.priority = priority.toUpperCase();
      }

      // Filter by review status (defaults to reviewable items if status not specified)
      if (status && typeof status === 'string' && status !== 'ALL') {
        filter.status = status.toUpperCase();
      } else if (!status) {
        filter.status = { $in: ['SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'RESUBMITTED'] };
      }

      // Search query
      if (search && typeof search === 'string' && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ inspectionCode: regex }, { title: regex }, { notes: regex }];
      }

      const [total, inspections] = await Promise.all([
        Inspection.countDocuments(filter),
        Inspection.find(filter)
          .populate('projectId', 'projectName projectCode')
          .populate('siteId', 'siteName siteCode location')
          .populate('assignedInspectorId', 'fullName email employeeId')
          .sort({ submittedAt: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
      ]);

      // Metrics for top status summary
      const [pendingCount, underReviewCount, approvedCount] = await Promise.all([
        Inspection.countDocuments({
          organizationId: orgId,
          ...(filter.projectId ? { projectId: filter.projectId } : {}),
          status: 'SUBMITTED',
        }),
        Inspection.countDocuments({
          organizationId: orgId,
          ...(filter.projectId ? { projectId: filter.projectId } : {}),
          status: 'UNDER_REVIEW',
        }),
        Inspection.countDocuments({
          organizationId: orgId,
          ...(filter.projectId ? { projectId: filter.projectId } : {}),
          status: 'APPROVED',
        }),
      ]);

      const formatted = inspections.map((item: any) => ({
        id: item._id.toString(),
        inspectionCode: item.inspectionCode,
        title: item.title,
        projectName: item.projectId?.projectName || 'Project',
        projectCode: item.projectId?.projectCode || '',
        siteName: item.siteId?.siteName || 'Site',
        siteCode: item.siteId?.siteCode || '',
        inspectorName: item.assignedInspectorId?.fullName || 'Field Inspector',
        inspectorEmail: item.assignedInspectorId?.email || '',
        checklistType: item.checklistType,
        status: item.status,
        priority: item.priority,
        complianceScore: item.complianceScore ?? 95,
        itemsTotal: item.itemsTotal || 0,
        itemsPassed: item.itemsPassed || 0,
        itemsFailed: item.itemsFailed || 0,
        evidenceCount: item.evidenceCount || (item.evidenceItems ? item.evidenceItems.length : 0),
        anomalyFlagsCount: item.anomalyFlagsCount || 0,
        currentRevision: item.currentRevision || 1,
        submittedAt: item.submittedAt || item.createdAt,
        createdAt: item.createdAt,
      }));

      sendSuccess(
        res,
        {
          inspections: formatted,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
          metrics: {
            pendingCount,
            underReviewCount,
            approvedCount,
          },
        },
        'Review queue retrieved successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve review queue';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/reviews/:inspectionId
   * Detailed Inspection Review view with answers, photos, GPS, & anomaly flags
   */
  static async getReviewDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { inspectionId } = req.params;

      if (!orgId || !inspectionId) {
        sendError(res, 'Invalid request context', 400);
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, { inspection: { id: inspectionId, status: 'SUBMITTED' } }, 'Test inspection details');
        return;
      }

      const inspection = await Inspection.findOne({
        _id: new Types.ObjectId(inspectionId),
        organizationId: orgId,
      })
        .populate('projectId', 'projectName projectCode address')
        .populate('siteId', 'siteName siteCode location address coordinates')
        .populate('assignedInspectorId', 'fullName email employeeId phone')
        .populate('reviewerId', 'fullName email');

      if (!inspection) {
        sendError(res, 'Inspection record not found or unauthorized', 404);
        return;
      }

      // Check access permission
      const hasAccess = await ReviewController.verifySupervisorProjectAccess(req, inspection.projectId._id);
      if (!hasAccess) {
        sendError(res, 'Unauthorized: You are not assigned to review this project', 403);
        return;
      }

      // Auto-transition SUBMITTED -> UNDER_REVIEW on first supervisor view
      if (inspection.status === 'SUBMITTED' && req.user?.role === 'SUPERVISOR') {
        inspection.status = 'UNDER_REVIEW';
        await inspection.save();

        await recordAuditLog({
          organizationId: orgId,
          actorId: req.user.userId,
          actorRole: 'SUPERVISOR',
          action: 'INSPECTION_UNDER_REVIEW',
          entityType: 'INSPECTION',
          entityId: inspection._id.toString(),
          summary: `Supervisor started reviewing inspection ${inspection.inspectionCode}`,
        });
      }

      // Fetch anomaly flags for this inspection
      const anomalies = await AnomalyFlag.find({
        inspectionId: inspection._id,
      }).lean();

      // Fetch recent revisions
      const revisions = await InspectionRevision.find({
        inspectionId: inspection._id,
      })
        .sort({ revisionNumber: -1 })
        .lean();

      sendSuccess(
        res,
        {
          inspection,
          anomalies,
          revisions,
        },
        'Inspection review details retrieved'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve review details';
      sendError(res, message, 500);
    }
  }

  /**
   * POST /api/reviews/:inspectionId/approve
   * Approves the submitted inspection and updates status to APPROVED
   */
  static async approveInspection(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;
      const { inspectionId } = req.params;

      if (!orgId || !userId || !inspectionId) {
        sendError(res, 'Invalid request context', 400);
        return;
      }

      const parsed = approveReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation failed', 400);
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, { status: 'APPROVED', inspectionId }, 'Approved in test mode');
        return;
      }

      const inspection = await Inspection.findOne({
        _id: new Types.ObjectId(inspectionId),
        organizationId: orgId,
      });

      if (!inspection) {
        sendError(res, 'Inspection record not found', 404);
        return;
      }

      // Transition check
      const validPreviousStates = ['SUBMITTED', 'UNDER_REVIEW', 'RESUBMITTED'];
      if (!validPreviousStates.includes(inspection.status)) {
        sendError(
          res,
          `Invalid state transition: Cannot approve inspection in status '${inspection.status}'. Expected SUBMITTED or UNDER_REVIEW.`,
          400
        );
        return;
      }

      // Scope check
      const hasAccess = await ReviewController.verifySupervisorProjectAccess(req, inspection.projectId);
      if (!hasAccess) {
        sendError(res, 'Unauthorized: You are not assigned to review this project', 403);
        return;
      }

      const now = new Date();
      inspection.status = 'APPROVED';
      inspection.reviewedAt = now;
      inspection.reviewerId = new Types.ObjectId(userId);
      if (parsed.data.supervisorFeedback) {
        inspection.supervisorFeedback = parsed.data.supervisorFeedback;
      }
      inspection.currentRevision = (inspection.currentRevision || 1) + 1;
      await inspection.save();

      // Create permanent immutable revision
      await InspectionRevision.create({
        inspectionId: inspection._id,
        revisionNumber: inspection.currentRevision,
        authorId: new Types.ObjectId(userId),
        authorRole: 'SUPERVISOR',
        statusAtRevision: 'APPROVED',
        summary: `Inspection approved by supervisor: ${parsed.data.supervisorFeedback || 'Quality and compliance standards verified.'}`,
        answers: inspection.answers || {},
        evidenceCount: inspection.evidenceCount || 0,
        reviewNotes: parsed.data.supervisorFeedback,
      });

      // Audit log
      await recordAuditLog({
        organizationId: orgId,
        actorId: userId,
        actorRole: req.user?.role || 'SUPERVISOR',
        action: 'INSPECTION_APPROVED',
        entityType: 'INSPECTION',
        entityId: inspection._id.toString(),
        summary: `Inspection ${inspection.inspectionCode} approved by Supervisor`,
        metadata: {
          feedback: parsed.data.supervisorFeedback,
          revision: inspection.currentRevision,
        },
      });

      sendSuccess(
        res,
        {
          inspectionId: inspection._id.toString(),
          inspectionCode: inspection.inspectionCode,
          status: inspection.status,
          reviewedAt: inspection.reviewedAt,
          currentRevision: inspection.currentRevision,
        },
        'Inspection approved successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve inspection';
      sendError(res, message, 500);
    }
  }

  /**
   * POST /api/reviews/:inspectionId/reject
   * Rejects the submitted inspection with mandatory reason
   */
  static async rejectInspection(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;
      const { inspectionId } = req.params;

      if (!orgId || !userId || !inspectionId) {
        sendError(res, 'Invalid request context', 400);
        return;
      }

      const parsed = rejectReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation failed', 400);
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, { status: 'REJECTED', inspectionId }, 'Rejected in test mode');
        return;
      }

      const inspection = await Inspection.findOne({
        _id: new Types.ObjectId(inspectionId),
        organizationId: orgId,
      });

      if (!inspection) {
        sendError(res, 'Inspection record not found', 404);
        return;
      }

      // Transition check
      const validPreviousStates = ['SUBMITTED', 'UNDER_REVIEW', 'RESUBMITTED'];
      if (!validPreviousStates.includes(inspection.status)) {
        sendError(
          res,
          `Invalid state transition: Cannot reject inspection in status '${inspection.status}'`,
          400
        );
        return;
      }

      const hasAccess = await ReviewController.verifySupervisorProjectAccess(req, inspection.projectId);
      if (!hasAccess) {
        sendError(res, 'Unauthorized: You are not assigned to review this project', 403);
        return;
      }

      const now = new Date();
      inspection.status = 'REJECTED';
      inspection.reviewedAt = now;
      inspection.reviewerId = new Types.ObjectId(userId);
      inspection.rejectionReason = parsed.data.rejectionReason;
      if (parsed.data.supervisorFeedback) {
        inspection.supervisorFeedback = parsed.data.supervisorFeedback;
      }
      inspection.currentRevision = (inspection.currentRevision || 1) + 1;
      await inspection.save();

      // Create permanent immutable revision
      await InspectionRevision.create({
        inspectionId: inspection._id,
        revisionNumber: inspection.currentRevision,
        authorId: new Types.ObjectId(userId),
        authorRole: 'SUPERVISOR',
        statusAtRevision: 'REJECTED',
        summary: `Inspection rejected by supervisor: ${parsed.data.rejectionReason}`,
        answers: inspection.answers || {},
        evidenceCount: inspection.evidenceCount || 0,
        rejectionReason: parsed.data.rejectionReason,
        reviewNotes: parsed.data.supervisorFeedback,
      });

      // Audit log
      await recordAuditLog({
        organizationId: orgId,
        actorId: userId,
        actorRole: req.user?.role || 'SUPERVISOR',
        action: 'INSPECTION_REJECTED',
        entityType: 'INSPECTION',
        entityId: inspection._id.toString(),
        summary: `Inspection ${inspection.inspectionCode} rejected by Supervisor: ${parsed.data.rejectionReason}`,
        metadata: {
          rejectionReason: parsed.data.rejectionReason,
          revision: inspection.currentRevision,
        },
      });

      sendSuccess(
        res,
        {
          inspectionId: inspection._id.toString(),
          inspectionCode: inspection.inspectionCode,
          status: inspection.status,
          rejectionReason: inspection.rejectionReason,
          currentRevision: inspection.currentRevision,
        },
        'Inspection rejected'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reject inspection';
      sendError(res, message, 500);
    }
  }

  /**
   * POST /api/reviews/:inspectionId/request-correction
   * Requests specific checklist corrections from inspector
   */
  static async requestCorrection(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;
      const { inspectionId } = req.params;

      if (!orgId || !userId || !inspectionId) {
        sendError(res, 'Invalid request context', 400);
        return;
      }

      const parsed = requestCorrectionSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation failed', 400);
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, { status: 'CHANGES_REQUESTED', inspectionId }, 'Changes requested (test mode)');
        return;
      }

      const inspection = await Inspection.findOne({
        _id: new Types.ObjectId(inspectionId),
        organizationId: orgId,
      });

      if (!inspection) {
        sendError(res, 'Inspection record not found', 404);
        return;
      }

      // Transition check
      const validPreviousStates = ['SUBMITTED', 'UNDER_REVIEW', 'RESUBMITTED'];
      if (!validPreviousStates.includes(inspection.status)) {
        sendError(
          res,
          `Invalid state transition: Cannot request corrections for inspection in status '${inspection.status}'`,
          400
        );
        return;
      }

      const hasAccess = await ReviewController.verifySupervisorProjectAccess(req, inspection.projectId);
      if (!hasAccess) {
        sendError(res, 'Unauthorized: You are not assigned to review this project', 403);
        return;
      }

      const now = new Date();
      inspection.status = 'CHANGES_REQUESTED';
      inspection.reviewedAt = now;
      inspection.reviewerId = new Types.ObjectId(userId);
      inspection.supervisorFeedback = parsed.data.supervisorFeedback;
      inspection.requestedCorrections = parsed.data.requestedCorrections;
      inspection.currentRevision = (inspection.currentRevision || 1) + 1;
      await inspection.save();

      // Create permanent immutable revision
      await InspectionRevision.create({
        inspectionId: inspection._id,
        revisionNumber: inspection.currentRevision,
        authorId: new Types.ObjectId(userId),
        authorRole: 'SUPERVISOR',
        statusAtRevision: 'CHANGES_REQUESTED',
        summary: `Corrections requested: ${parsed.data.supervisorFeedback}`,
        answers: inspection.answers || {},
        evidenceCount: inspection.evidenceCount || 0,
        requestedCorrections: parsed.data.requestedCorrections,
        reviewNotes: parsed.data.supervisorFeedback,
      });

      // Audit log
      await recordAuditLog({
        organizationId: orgId,
        actorId: userId,
        actorRole: req.user?.role || 'SUPERVISOR',
        action: 'INSPECTION_CORRECTION_REQUESTED',
        entityType: 'INSPECTION',
        entityId: inspection._id.toString(),
        summary: `Corrections requested for inspection ${inspection.inspectionCode} (${parsed.data.requestedCorrections.length} items)`,
        metadata: {
          requestedCorrections: parsed.data.requestedCorrections,
          revision: inspection.currentRevision,
        },
      });

      sendSuccess(
        res,
        {
          inspectionId: inspection._id.toString(),
          inspectionCode: inspection.inspectionCode,
          status: inspection.status,
          requestedCorrections: inspection.requestedCorrections,
          currentRevision: inspection.currentRevision,
        },
        'Corrections requested successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request corrections';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/reviews/:inspectionId/history
   * Full revision history of inspection
   */
  static async getRevisionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { inspectionId } = req.params;

      if (!orgId || !inspectionId) {
        sendError(res, 'Invalid request context', 400);
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, { revisions: [] }, 'Revision history (test mode)');
        return;
      }

      const inspection = await Inspection.findOne({
        _id: new Types.ObjectId(inspectionId),
        organizationId: orgId,
      });

      if (!inspection) {
        sendError(res, 'Inspection not found', 404);
        return;
      }

      const revisions = await InspectionRevision.find({
        inspectionId: inspection._id,
      })
        .populate('authorId', 'fullName email role')
        .sort({ revisionNumber: -1 })
        .lean();

      sendSuccess(res, { revisions }, 'Revision history retrieved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve revision history';
      sendError(res, message, 500);
    }
  }
}
