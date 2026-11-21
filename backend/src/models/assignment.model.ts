import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type AssignmentStatus = 'ACTIVE' | 'COMPLETED' | 'REVOKED';

export interface IProjectSupervisorAssignmentDocument extends Document {
  id: string;
  organizationId: string;
  projectId: Types.ObjectId;
  supervisorId: Types.ObjectId;
  assignedBy: string; // userId of the admin
  assignedAt: Date;
  status: 'ACTIVE' | 'REVOKED';
  revokedAt?: Date;
  revokedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSupervisorAssignmentSchema = new Schema<IProjectSupervisorAssignmentDocument>(
  {
    organizationId: {
      type: String,
      required: [true, 'Organization ID is required'],
      trim: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    supervisorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supervisor reference is required'],
      index: true,
    },
    assignedBy: {
      type: String,
      required: [true, 'Assigned by user ID is required'],
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'REVOKED'],
      default: 'ACTIVE',
      index: true,
    },
    revokedAt: {
      type: Date,
    },
    revokedBy: {
      type: String,
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

// Indexes
projectSupervisorAssignmentSchema.index(
  { organizationId: 1, projectId: 1, supervisorId: 1, status: 1 }
);
projectSupervisorAssignmentSchema.index({ supervisorId: 1, status: 1 });

export const ProjectSupervisorAssignment: Model<IProjectSupervisorAssignmentDocument> =
  mongoose.model<IProjectSupervisorAssignmentDocument>(
    'ProjectSupervisorAssignment',
    projectSupervisorAssignmentSchema
  );

export interface ISiteInspectorAssignmentDocument extends Document {
  id: string;
  organizationId: string;
  projectId: Types.ObjectId;
  siteId: Types.ObjectId;
  inspectorId: Types.ObjectId;
  supervisorId: Types.ObjectId;
  assignedBy: string; // userId
  assignedAt: Date;
  startDate?: Date;
  endDate?: Date;
  instructions?: string;
  status: AssignmentStatus;
  revokedAt?: Date;
  revokedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const siteInspectorAssignmentSchema = new Schema<ISiteInspectorAssignmentDocument>(
  {
    organizationId: {
      type: String,
      required: [true, 'Organization ID is required'],
      trim: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    siteId: {
      type: Schema.Types.ObjectId,
      ref: 'Site',
      required: [true, 'Site reference is required'],
      index: true,
    },
    inspectorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inspector reference is required'],
      index: true,
    },
    supervisorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supervisor reference is required'],
      index: true,
    },
    assignedBy: {
      type: String,
      required: [true, 'Assigned by user ID is required'],
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'REVOKED'],
      default: 'ACTIVE',
      index: true,
    },
    revokedAt: {
      type: Date,
    },
    revokedBy: {
      type: String,
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

// Indexes
siteInspectorAssignmentSchema.index(
  { organizationId: 1, siteId: 1, inspectorId: 1, status: 1 }
);
siteInspectorAssignmentSchema.index({ inspectorId: 1, status: 1 });
siteInspectorAssignmentSchema.index({ supervisorId: 1, status: 1 });
siteInspectorAssignmentSchema.index({ projectId: 1, status: 1 });

export const SiteInspectorAssignment: Model<ISiteInspectorAssignmentDocument> =
  mongoose.model<ISiteInspectorAssignmentDocument>(
    'SiteInspectorAssignment',
    siteInspectorAssignmentSchema
  );
