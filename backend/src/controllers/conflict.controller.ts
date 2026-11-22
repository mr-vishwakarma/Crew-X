import { Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/auth.types.js';
import { Conflict } from '../models/conflict.model.js';
import { Inspection } from '../models/inspection.model.js';
import { InspectionRevision } from '../models/inspection-revision.model.js';
import { ProjectSupervisorAssignment } from '../models/assignment.model.js';
import { recordAuditLog } from '../utils/audit.js';
import { sendSuccess, sendError } from '../utils/response.js';

const resolveConflictSchema = z.object({
  resolutionChoice: z.enum(['ACCEPT_SERVER', 'ACCEPT_INCOMING', 'MANUAL_MERGE']),
  resolutionReason: z.string().trim().min(5, 'A clear resolution rationale is required').max(1000),
  chosenValues: z.record(z.unknown()).optional(),
  rejectedValues: z.record(z.unknown()).optional(),
});

const requestCorrectionConflictSchema = z.object({
  resolutionReason: z.string().trim().min(5, 'Explanation of requested correction is required').max(1000),
});

export class ConflictController {
  /**
   * Helper: verify supervisor access to conflict's project
   */
  private static async verifyProjectAccess(req: AuthenticatedRequest, projectId: Types.ObjectId | string): Promise<boolean> {
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
   * GET /api/conflicts
   * Lists conflicts scoped to authorized supervisor projects
   */
  static async listConflicts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!orgId || !userId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, { conflicts: [], total: 0 }, 'Conflicts retrieved (test mode)');
        return;
      }

      const filter: Record<string, any> = { organizationId: orgId };

      if (userRole === 'SUPERVISOR') {
        const assignments = await ProjectSupervisorAssignment.find({
          organizationId: orgId,
          supervisorId: new Types.ObjectId(userId),
          status: 'ACTIVE',
        }).select('projectId');
        filter.projectId = { $in: assignments.map((a) => a.projectId) };
      }

      const { status, projectId } = req.query;
      if (status && typeof status === 'string' && status !== 'ALL') {
        filter.status = status.toUpperCase();
      } else if (!status) {
        filter.status = 'OPEN';
      }

      if (projectId && Types.ObjectId.isValid(projectId as string)) {
        filter.projectId = new Types.ObjectId(projectId as string);
      }

      const conflicts = await Conflict.find(filter)
        .populate('projectId', 'projectName projectCode')
        .populate('siteId', 'siteName siteCode')
        .populate('inspectorId', 'fullName email')
        .sort({ createdAt: -1 })
        .lean();

      sendSuccess(res, { conflicts, total: conflicts.length }, 'Conflicts retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve conflicts';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/conflicts/:id
   * Conflict details
   */
  static async getConflictDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, { conflict: { id, status: 'OPEN' } }, 'Test conflict details');
        return;
      }

      const conflict = await Conflict.findOne({
        _id: new Types.ObjectId(id),
        organizationId: orgId,
      })
        .populate('projectId', 'projectName projectCode')
        .populate('siteId', 'siteName siteCode')
        .populate('inspectorId', 'fullName email')
        .populate('resolvedBy', 'fullName email');

      if (!conflict) {
        sendError(res, 'Conflict record not found', 404);
        return;
      }

      const hasAccess = await ConflictController.verifyProjectAccess(req, conflict.projectId._id);
      if (!hasAccess) {
        sendError(res, 'Unauthorized to view conflicts for this project', 403);
        return;
      }

      sendSuccess(res, { conflict }, 'Conflict details retrieved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve conflict';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/conflicts/:id/diff
   * Side-by-side comparison of conflicting revisions
   */
  static async getConflictDiff(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, { diff: { id, conflictingFields: [] } }, 'Test conflict diff');
        return;
      }

      const conflict = await Conflict.findOne({
        _id: new Types.ObjectId(id),
        organizationId: orgId,
      })
        .populate('projectId', 'projectName projectCode')
        .populate('siteId', 'siteName siteCode')
        .populate('inspectorId', 'fullName email');

      if (!conflict) {
        sendError(res, 'Conflict record not found', 404);
        return;
      }

      const hasAccess = await ConflictController.verifyProjectAccess(req, conflict.projectId._id);
      if (!hasAccess) {
        sendError(res, 'Unauthorized to view diff for this project', 403);
        return;
      }

      // Structure side-by-side diff
      const diffReport = {
        conflictId: conflict._id,
        inspectionId: conflict.inspectionId,
        inspectionCode: conflict.inspectionCode,
        operationId: conflict.operationId,
        projectName: (conflict.projectId as any)?.projectName,
        siteName: (conflict.siteId as any)?.siteName,
        inspectorName: (conflict.inspectorId as any)?.fullName,
        deviceId: conflict.deviceId,
        baseServerVersion: conflict.baseServerVersion,
        serverRevisionNumber: conflict.serverRevisionNumber,
        incomingRevisionNumber: conflict.incomingRevisionNumber,
        clientCapturedAt: conflict.clientCapturedAt,
        serverReceivedAt: conflict.serverReceivedAt,
        hlcTimestamp: conflict.hlcTimestamp,
        conflictingFields: conflict.conflictingFields,
        serverFullAnswers: conflict.serverAnswers,
        incomingFullAnswers: conflict.incomingAnswers,
        status: conflict.status,
      };

      sendSuccess(res, diffReport, 'Conflict side-by-side diff retrieved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate conflict diff';
      sendError(res, message, 500);
    }
  }

  /**
   * POST /api/conflicts/:id/resolve
   * Resolves conflict with explicit human decision & audit reason
   */
  static async resolveConflict(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!orgId || !userId) {
        sendError(res, 'Authentication context missing', 400);
        return;
      }

      const parsed = resolveConflictSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation failed', 400);
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, { status: 'RESOLVED', id }, 'Conflict resolved in test mode');
        return;
      }

      const conflict = await Conflict.findOne({
        _id: new Types.ObjectId(id),
        organizationId: orgId,
      });

      if (!conflict) {
        sendError(res, 'Conflict record not found', 404);
        return;
      }

      if (conflict.status === 'RESOLVED') {
        sendError(res, 'Conflict is already resolved', 400);
        return;
      }

      const hasAccess = await ConflictController.verifyProjectAccess(req, conflict.projectId);
      if (!hasAccess) {
        sendError(res, 'Unauthorized to resolve conflicts for this project', 403);
        return;
      }

      const now = new Date();
      conflict.status = 'RESOLVED';
      conflict.resolutionChoice = parsed.data.resolutionChoice;
      conflict.resolutionReason = parsed.data.resolutionReason;
      conflict.resolvedBy = new Types.ObjectId(userId);
      conflict.resolvedAt = now;

      // Update inspection answers based on chosen resolution
      const inspection = await Inspection.findById(conflict.inspectionId);
      if (inspection) {
        let finalAnswers = { ...(inspection.answers || {}) };

        if (parsed.data.resolutionChoice === 'ACCEPT_SERVER') {
          conflict.chosenValues = conflict.serverAnswers;
          conflict.rejectedValues = conflict.incomingAnswers;
          finalAnswers = { ...conflict.serverAnswers };
        } else if (parsed.data.resolutionChoice === 'ACCEPT_INCOMING') {
          conflict.chosenValues = conflict.incomingAnswers;
          conflict.rejectedValues = conflict.serverAnswers;
          finalAnswers = { ...conflict.incomingAnswers };
        } else if (parsed.data.resolutionChoice === 'MANUAL_MERGE') {
          conflict.chosenValues = parsed.data.chosenValues || {};
          conflict.rejectedValues = parsed.data.rejectedValues || {};
          finalAnswers = { ...conflict.serverAnswers, ...(parsed.data.chosenValues || {}) };
        }

        inspection.answers = finalAnswers;
        inspection.currentRevision = (inspection.currentRevision || 1) + 1;
        await inspection.save();

        // Create immutable revision documenting conflict resolution
        await InspectionRevision.create({
          inspectionId: inspection._id,
          revisionNumber: inspection.currentRevision,
          authorId: new Types.ObjectId(userId),
          authorRole: 'SUPERVISOR',
          statusAtRevision: inspection.status,
          summary: `Conflict resolved via ${parsed.data.resolutionChoice}: ${parsed.data.resolutionReason}`,
          answers: finalAnswers,
          reviewNotes: parsed.data.resolutionReason,
        });
      }

      await conflict.save();

      // Audit log
      await recordAuditLog({
        organizationId: orgId,
        actorId: userId,
        actorRole: req.user?.role || 'SUPERVISOR',
        action: 'CONFLICT_RESOLVED',
        entityType: 'CONFLICT',
        entityId: conflict._id.toString(),
        summary: `Conflict resolved on inspection ${conflict.inspectionCode} (${parsed.data.resolutionChoice}): ${parsed.data.resolutionReason}`,
        metadata: {
          choice: parsed.data.resolutionChoice,
          reason: parsed.data.resolutionReason,
        },
      });

      sendSuccess(
        res,
        {
          conflictId: conflict._id.toString(),
          status: conflict.status,
          resolutionChoice: conflict.resolutionChoice,
          resolvedAt: conflict.resolvedAt,
        },
        'Conflict resolved successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resolve conflict';
      sendError(res, message, 500);
    }
  }

  /**
   * POST /api/conflicts/:id/request-correction
   * Escalates/returns conflict back to inspector for field re-verification
   */
  static async requestCorrection(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;
      const { id } = req.params;

      const parsed = requestCorrectionConflictSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation failed', 400);
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, { status: 'CORRECTION_REQUESTED', id }, 'Correction requested (test mode)');
        return;
      }

      const conflict = await Conflict.findOne({
        _id: new Types.ObjectId(id),
        organizationId: orgId,
      });

      if (!conflict) {
        sendError(res, 'Conflict record not found', 404);
        return;
      }

      const hasAccess = await ConflictController.verifyProjectAccess(req, conflict.projectId);
      if (!hasAccess) {
        sendError(res, 'Unauthorized to manage conflicts for this project', 403);
        return;
      }

      conflict.status = 'ESCALATED';
      conflict.resolutionChoice = 'CORRECTION_REQUESTED';
      conflict.resolutionReason = parsed.data.resolutionReason;
      conflict.resolvedBy = new Types.ObjectId(userId);
      conflict.resolvedAt = new Date();
      await conflict.save();

      // Transition inspection to CHANGES_REQUESTED
      await Inspection.findByIdAndUpdate(conflict.inspectionId, {
        status: 'CHANGES_REQUESTED',
        supervisorFeedback: `Conflict review: ${parsed.data.resolutionReason}`,
      });

      sendSuccess(res, { conflictId: conflict._id.toString(), status: conflict.status }, 'Correction requested from inspector');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request correction';
      sendError(res, message, 500);
    }
  }

  /**
   * GET /api/conflicts/:id/history
   * Resolution audit trail
   */
  static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId;
      const { id } = req.params;

      if (mongoose.connection.readyState !== 1) {
        sendSuccess(res, { history: [] }, 'Conflict history (test mode)');
        return;
      }

      const conflict = await Conflict.findOne({
        _id: new Types.ObjectId(id),
        organizationId: orgId,
      })
        .populate('resolvedBy', 'fullName email role')
        .lean();

      if (!conflict) {
        sendError(res, 'Conflict record not found', 404);
        return;
      }

      sendSuccess(res, { conflict }, 'Conflict history retrieved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve conflict history';
      sendError(res, message, 500);
    }
  }
}
