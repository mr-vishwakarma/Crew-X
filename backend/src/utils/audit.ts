import mongoose, { Types } from 'mongoose';
import { AuditLog, AuditAction } from '../models/audit-log.model.js';

interface AuditLogOptions {
  organizationId: string;
  actorId: Types.ObjectId | string;
  actorRole: string;
  action: AuditAction;
  entityType: 'INSPECTION' | 'CONFLICT' | 'ANOMALY' | 'REPORT' | 'SUBSCRIPTION' | 'USER' | 'SYSTEM';
  entityId: string;
  summary: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Persists an immutable append-only audit event to MongoDB.
 * Never throws an unhandled error so operational flow is not disrupted.
 */
export async function recordAuditLog(options: AuditLogOptions): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1) {
      await AuditLog.create({
        ...options,
        metadata: options.metadata || {},
      });
    } else {
      // In offline / memory / test mode, log for visibility
      console.log(`[AUDIT] ${options.action} on ${options.entityType}:${options.entityId} by ${options.actorRole} (${options.actorId})`);
    }
  } catch (err) {
    console.error('[AUDIT ERROR] Failed to record audit log:', err);
  }
}
