import mongoose, { Document, Schema, Types } from 'mongoose';

export type ConflictStatus = 'OPEN' | 'RESOLVED' | 'ESCALATED' | 'DISMISSED';
export type ConflictResolutionChoice = 'ACCEPT_SERVER' | 'ACCEPT_INCOMING' | 'MANUAL_MERGE' | 'CORRECTION_REQUESTED';

export interface IConflict extends Document {
  operationId: string;
  inspectionId: Types.ObjectId;
  inspectionCode: string;
  organizationId: string;
  projectId: Types.ObjectId;
  siteId: Types.ObjectId;
  inspectorId: Types.ObjectId;
  inspectorName?: string;
  deviceId?: string;
  baseServerVersion: number;
  serverRevisionNumber: number;
  incomingRevisionNumber: number;
  serverAnswers: Record<string, any>;
  incomingAnswers: Record<string, any>;
  conflictingFields: Array<{
    field: string;
    questionText?: string;
    serverValue: any;
    incomingValue: any;
    resolvedValue?: any;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  status: ConflictStatus;
  resolutionChoice?: ConflictResolutionChoice;
  chosenValues?: Record<string, any>;
  rejectedValues?: Record<string, any>;
  resolvedBy?: Types.ObjectId;
  resolvedByName?: string;
  resolvedAt?: Date;
  resolutionReason?: string;
  hlcTimestamp?: {
    millis: number;
    counter: number;
    nodeId: string;
  };
  clientCapturedAt?: Date;
  serverReceivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConflictSchema = new Schema<IConflict>(
  {
    operationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    inspectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Inspection',
      required: true,
      index: true,
    },
    inspectionCode: {
      type: String,
      required: true,
      index: true,
    },
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
    inspectorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    inspectorName: String,
    deviceId: String,
    baseServerVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    serverRevisionNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    incomingRevisionNumber: {
      type: Number,
      required: true,
      default: 2,
    },
    serverAnswers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    incomingAnswers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    conflictingFields: [
      {
        field: { type: String, required: true },
        questionText: String,
        serverValue: Schema.Types.Mixed,
        incomingValue: Schema.Types.Mixed,
        resolvedValue: Schema.Types.Mixed,
        severity: {
          type: String,
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          default: 'MEDIUM',
        },
      },
    ],
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED', 'ESCALATED', 'DISMISSED'],
      default: 'OPEN',
      index: true,
    },
    resolutionChoice: {
      type: String,
      enum: ['ACCEPT_SERVER', 'ACCEPT_INCOMING', 'MANUAL_MERGE', 'CORRECTION_REQUESTED'],
    },
    chosenValues: {
      type: Schema.Types.Mixed,
      default: {},
    },
    rejectedValues: {
      type: Schema.Types.Mixed,
      default: {},
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedByName: String,
    resolvedAt: Date,
    resolutionReason: String,
    hlcTimestamp: {
      millis: Number,
      counter: Number,
      nodeId: String,
    },
    clientCapturedAt: Date,
    serverReceivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ConflictSchema.index({ organizationId: 1, status: 1 });
ConflictSchema.index({ projectId: 1, status: 1 });

export const Conflict = mongoose.model<IConflict>('Conflict', ConflictSchema);
