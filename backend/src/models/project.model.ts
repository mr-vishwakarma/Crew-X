import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IProject, ProjectPriority, ProjectStatus } from '../types/project.types.js';

export interface IProjectDocument extends Omit<IProject, '_id' | 'assignedSupervisors'>, Document {
  id: string;
  assignedSupervisors: Types.ObjectId[];
}

const projectSchema = new Schema<IProjectDocument>(
  {
    organizationId: {
      type: String,
      required: [true, 'Organization ID is required'],
      trim: true,
      index: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters'],
      maxlength: [150, 'Project name cannot exceed 150 characters'],
    },
    projectCode: {
      type: String,
      required: [true, 'Project code is required'],
      trim: true,
      uppercase: true,
      minlength: [2, 'Project code must be at least 2 characters'],
      maxlength: [30, 'Project code cannot exceed 30 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      default: 'Construction & Infrastructure',
    },
    clientName: {
      type: String,
      trim: true,
      default: '',
    },
    projectManager: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    expectedEndDate: {
      type: Date,
      required: [true, 'Expected end date is required'],
    },
    actualEndDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] as ProjectStatus[],
        message: '{VALUE} is not a valid project status',
      },
      default: 'PLANNED',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as ProjectPriority[],
        message: '{VALUE} is not a valid priority',
      },
      default: 'MEDIUM',
      index: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    assignedSupervisors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: String,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index ensuring project code uniqueness per organization
projectSchema.index({ organizationId: 1, projectCode: 1 }, { unique: true });
// Search index on projectName and projectCode
projectSchema.index({ organizationId: 1, isArchived: 1, status: 1 });

export const Project: Model<IProjectDocument> = mongoose.model<IProjectDocument>(
  'Project',
  projectSchema
);
