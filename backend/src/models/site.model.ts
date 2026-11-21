import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { ISite, SiteStatus, SiteType } from '../types/project.types.js';

export interface ISiteDocument extends Omit<ISite, '_id' | 'projectId'>, Document {
  id: string;
  projectId: Types.ObjectId;
}

const siteSchema = new Schema<ISiteDocument>(
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
      required: [true, 'Associated Project is required'],
      index: true,
    },
    siteName: {
      type: String,
      required: [true, 'Site name is required'],
      trim: true,
      minlength: [2, 'Site name must be at least 2 characters'],
      maxlength: [150, 'Site name cannot exceed 150 characters'],
    },
    siteCode: {
      type: String,
      required: [true, 'Site code is required'],
      trim: true,
      uppercase: true,
      minlength: [2, 'Site code must be at least 2 characters'],
      maxlength: [30, 'Site code cannot exceed 30 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    siteType: {
      type: String,
      enum: {
        values: [
          'CONSTRUCTION',
          'MANUFACTURING',
          'AGRICULTURE',
          'INFRASTRUCTURE',
          'WAREHOUSE',
          'OTHER',
        ] as SiteType[],
        message: '{VALUE} is not a valid site type',
      },
      default: 'CONSTRUCTION',
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Site address is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    postalCode: {
      type: String,
      trim: true,
      default: '',
    },
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    siteManager: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'COMPLETED'] as SiteStatus[],
        message: '{VALUE} is not a valid site status',
      },
      default: 'ACTIVE',
      index: true,
    },
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

// Compound unique index for siteCode per organization
siteSchema.index({ organizationId: 1, siteCode: 1 }, { unique: true });
siteSchema.index({ organizationId: 1, projectId: 1, isArchived: 1 });

export const Site: Model<ISiteDocument> = mongoose.model<ISiteDocument>('Site', siteSchema);
