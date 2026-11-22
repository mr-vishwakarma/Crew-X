import mongoose, { Document, Schema, Types } from 'mongoose';

export type AnomalyCategory =
  | 'POSSIBLE_DUPLICATE_INSPECTION'
  | 'OVERLAPPING_INSPECTION'
  | 'TIMESTAMP_SKEW'
  | 'GPS_MISSING'
  | 'GPS_LOW_ACCURACY'
  | 'GPS_OUTSIDE_SITE_BOUNDARY'
  | 'DUPLICATE_EVIDENCE_HASH'
  | 'CHECKLIST_VERSION_MISMATCH'
  | 'ASSIGNMENT_REVOKED'
  | 'INVALID_STATUS_TRANSITION'
  | 'CONCURRENT_FIELD_EDIT'
  | 'MISSING_REQUIRED_EVIDENCE';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AnomalyStatus = 'OPEN' | 'REVIEWED' | 'DISMISSED' | 'RESOLVED';

export interface IAnomalyFlag extends Document {
  organizationId: string;
  projectId: Types.ObjectId;
  siteId: Types.ObjectId;
  inspectionId: Types.ObjectId;
  category: AnomalyCategory;
  severity: AnomalySeverity;
  description: string;
  affectedField?: string;
  supportingEvidence?: Record<string, any>;
  status: AnomalyStatus;
  detectedAt: Date;
  resolvedBy?: Types.ObjectId;
  resolutionReason?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnomalyFlagSchema = new Schema<IAnomalyFlag>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    siteId: {
      type: Schema.Types.ObjectId,
      ref: 'Site',
      required: true,
      index: true,
    },
    inspectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Inspection',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'POSSIBLE_DUPLICATE_INSPECTION',
        'OVERLAPPING_INSPECTION',
        'TIMESTAMP_SKEW',
        'GPS_MISSING',
        'GPS_LOW_ACCURACY',
        'GPS_OUTSIDE_SITE_BOUNDARY',
        'DUPLICATE_EVIDENCE_HASH',
        'CHECKLIST_VERSION_MISMATCH',
        'ASSIGNMENT_REVOKED',
        'INVALID_STATUS_TRANSITION',
        'CONCURRENT_FIELD_EDIT',
        'MISSING_REQUIRED_EVIDENCE',
      ],
      index: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    affectedField: String,
    supportingEvidence: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['OPEN', 'REVIEWED', 'DISMISSED', 'RESOLVED'],
      default: 'OPEN',
      index: true,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolutionReason: String,
    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);

AnomalyFlagSchema.index({ inspectionId: 1, status: 1 });
AnomalyFlagSchema.index({ organizationId: 1, category: 1, status: 1 });

export const AnomalyFlag = mongoose.model<IAnomalyFlag>('AnomalyFlag', AnomalyFlagSchema);
