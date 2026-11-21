import mongoose, { Document, Schema, Model } from 'mongoose';
import { IOrganization } from '../types/project.types.js';

export interface IOrganizationDocument extends Omit<IOrganization, '_id'>, Document {
  id: string;
}

const organizationSchema = new Schema<IOrganizationDocument>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      minlength: [2, 'Organization name must be at least 2 characters'],
      maxlength: [150, 'Organization name cannot exceed 150 characters'],
    },
    code: {
      type: String,
      required: [true, 'Organization code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [2, 'Organization code must be at least 2 characters'],
      maxlength: [30, 'Organization code cannot exceed 30 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      default: 'Infrastructure & Construction',
    },
    officialEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        'Please provide a valid email address',
      ],
      default: 'contact@nirikshan.org',
    },
    contactNumber: {
      type: String,
      trim: true,
      default: '+91 98765 43210',
    },
    address: {
      type: String,
      trim: true,
      default: '124 Industrial Tech Park, Sector 62',
    },
    city: {
      type: String,
      trim: true,
      default: 'Noida',
    },
    state: {
      type: String,
      trim: true,
      default: 'Uttar Pradesh',
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    postalCode: {
      type: String,
      trim: true,
      default: '201301',
    },
    logoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
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

export const Organization: Model<IOrganizationDocument> = mongoose.model<IOrganizationDocument>(
  'Organization',
  organizationSchema
);
