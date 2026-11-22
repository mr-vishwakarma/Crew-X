import mongoose, { Document, Schema, Types } from 'mongoose';

export type InspectionStatus =
  | 'DRAFT'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'READY_TO_SUBMIT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED'
  | 'RESUBMITTED';

export type InspectionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IInspection extends Document {
  inspectionCode: string;
  title: string;
  organizationId: string;
  projectId: Types.ObjectId;
  siteId: Types.ObjectId;
  assignedInspectorId?: Types.ObjectId;
  supervisorId?: Types.ObjectId;
  checklistType: string;
  status: InspectionStatus;
  priority: InspectionPriority;
  dueDate: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewerId?: Types.ObjectId;
  complianceScore?: number;
  itemsTotal: number;
  itemsPassed: number;
  itemsFailed: number;
  currentRevision: number;
  answers?: Record<string, any>;
  evidenceCount: number;
  evidenceItems?: Array<{
    photoId?: string;
    questionId?: string;
    caption?: string;
    storageUrl?: string;
    photoHash?: string;
    capturedAt?: Date;
    latitude?: number;
    longitude?: number;
    gpsAccuracy?: number;
  }>;
  isOfflineCreated: boolean;
  syncedAt?: Date;
  notes?: string;
  supervisorFeedback?: string;
  rejectionReason?: string;
  requestedCorrections?: Array<{
    questionId: string;
    issueDescription: string;
    resolved?: boolean;
  }>;
  anomalyFlagsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const InspectionSchema = new Schema<IInspection>(
  {
    inspectionCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    organizationId: {
      type: String,
      required: true,
      trim: true,
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
    assignedInspectorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    supervisorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    checklistType: {
      type: String,
      required: true,
      trim: true,
      default: 'ISO-9001 Quality & Safety Audit',
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'ASSIGNED',
        'IN_PROGRESS',
        'READY_TO_SUBMIT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'CHANGES_REQUESTED',
        'RESUBMITTED',
      ],
      default: 'ASSIGNED',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    submittedAt: {
      type: Date,
      index: true,
    },
    reviewedAt: {
      type: Date,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    complianceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 95,
    },
    itemsTotal: {
      type: Number,
      default: 24,
    },
    itemsPassed: {
      type: Number,
      default: 23,
    },
    itemsFailed: {
      type: Number,
      default: 1,
    },
    currentRevision: {
      type: Number,
      default: 1,
    },
    answers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    evidenceCount: {
      type: Number,
      default: 0,
    },
    evidenceItems: [
      {
        photoId: String,
        questionId: String,
        caption: String,
        storageUrl: String,
        photoHash: String,
        capturedAt: Date,
        latitude: Number,
        longitude: Number,
        gpsAccuracy: Number,
      },
    ],
    isOfflineCreated: {
      type: Boolean,
      default: false,
    },
    syncedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    supervisorFeedback: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    requestedCorrections: [
      {
        questionId: String,
        issueDescription: String,
        resolved: { type: Boolean, default: false },
      },
    ],
    anomalyFlagsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal dashboard and review aggregation queries
InspectionSchema.index({ organizationId: 1, status: 1 });
InspectionSchema.index({ organizationId: 1, dueDate: 1 });
InspectionSchema.index({ projectId: 1, status: 1 });
InspectionSchema.index({ siteId: 1, status: 1 });
InspectionSchema.index({ assignedInspectorId: 1, status: 1 });
InspectionSchema.index({ organizationId: 1, submittedAt: -1 });

export const Inspection = mongoose.model<IInspection>('Inspection', InspectionSchema);
