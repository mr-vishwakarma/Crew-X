import mongoose, { Document, Schema, Types } from 'mongoose';

export type AuditAction =
  | 'INSPECTION_SUBMITTED'
  | 'INSPECTION_UNDER_REVIEW'
  | 'INSPECTION_APPROVED'
  | 'INSPECTION_REJECTED'
  | 'INSPECTION_CORRECTION_REQUESTED'
  | 'INSPECTION_RESUBMITTED'
  | 'CONFLICT_DETECTED'
  | 'CONFLICT_RESOLVED'
  | 'ANOMALY_FLAGGED'
  | 'ANOMALY_RESOLVED'
  | 'EXPORT_GENERATED'
  | 'EMAIL_SCHEDULE_UPDATED'
  | 'EMAIL_SENT'
  | 'EMAIL_FAILED'
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_ACTIVATED'
  | 'SUBSCRIPTION_UPGRADED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'PAYMENT_RECEIVED'
  | 'RENEWAL_FAILED'
  | 'SUPERVISOR_SEAT_BLOCKED';

export interface IAuditLog extends Document {
  organizationId: string;
  actorId: Types.ObjectId | string;
  actorRole: string;
  action: AuditAction;
  entityType: 'INSPECTION' | 'CONFLICT' | 'ANOMALY' | 'REPORT' | 'SUBSCRIPTION' | 'USER' | 'SYSTEM';
  entityId: string;
  summary: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    actorId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    actorRole: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['INSPECTION', 'CONFLICT', 'ANOMALY', 'REPORT', 'SUBSCRIPTION', 'USER', 'SYSTEM'],
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only immutable log
  }
);

AuditLogSchema.index({ organizationId: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
