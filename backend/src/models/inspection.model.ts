import mongoose, { Document, Schema, Types } from 'mongoose';

export type InspectionStatus =
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'CHANGES_REQUESTED';

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
  complianceScore?: number;
  itemsTotal: number;
  itemsPassed: number;
  itemsFailed: number;
  isOfflineCreated: boolean;
  syncedAt?: Date;
  notes?: string;
  supervisorFeedback?: string;
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
      enum: ['ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'],
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
    },
    reviewedAt: {
      type: Date,
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
    isOfflineCreated: {
      type: Boolean,
      default: false,
    },
    syncedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    supervisorFeedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal dashboard aggregation queries
InspectionSchema.index({ organizationId: 1, status: 1 });
InspectionSchema.index({ organizationId: 1, dueDate: 1 });
InspectionSchema.index({ projectId: 1, status: 1 });
InspectionSchema.index({ supervisorId: 1, status: 1 });
InspectionSchema.index({ assignedInspectorId: 1, status: 1 });

export const Inspection = mongoose.model<IInspection>('Inspection', InspectionSchema);
