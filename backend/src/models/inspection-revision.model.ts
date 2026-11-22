import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInspectionRevision extends Document {
  inspectionId: Types.ObjectId;
  revisionNumber: number;
  authorId: Types.ObjectId | string;
  authorRole: 'INSPECTOR' | 'SUPERVISOR' | 'ADMIN';
  deviceId?: string;
  baseServerVersion: number;
  statusAtRevision: string;
  summary: string;
  answers: Record<string, any>;
  evidenceCount: number;
  evidenceItems: Array<{
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
  reviewNotes?: string;
  rejectionReason?: string;
  requestedCorrections?: Array<{
    questionId: string;
    issueDescription: string;
    resolved?: boolean;
  }>;
  hlcTimestamp?: {
    millis: number;
    counter: number;
    nodeId: string;
  };
  createdAt: Date;
}

const InspectionRevisionSchema = new Schema<IInspectionRevision>(
  {
    inspectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Inspection',
      required: true,
      index: true,
    },
    revisionNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    authorId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    authorRole: {
      type: String,
      required: true,
      enum: ['INSPECTOR', 'SUPERVISOR', 'ADMIN'],
    },
    deviceId: {
      type: String,
      trim: true,
    },
    baseServerVersion: {
      type: Number,
      default: 1,
    },
    statusAtRevision: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      trim: true,
      default: '',
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
    reviewNotes: {
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
    hlcTimestamp: {
      millis: Number,
      counter: Number,
      nodeId: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable revisions
  }
);

// Compound index for querying revisions in order
InspectionRevisionSchema.index({ inspectionId: 1, revisionNumber: -1 });

export const InspectionRevision = mongoose.model<IInspectionRevision>(
  'InspectionRevision',
  InspectionRevisionSchema
);
