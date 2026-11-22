import mongoose, { Document, Schema } from 'mongoose';

export type PlanCode = 'STARTER' | 'GROWTH' | 'ENTERPRISE';

export interface ISubscriptionPlan extends Document {
  planCode: PlanCode;
  name: string;
  version: number;
  description: string;
  monthlyPricePaise: number;
  annualPricePaise: number;
  currency: string;
  minSupervisorSeats: number;
  maxSupervisorSeats: number; // e.g. 3 for STARTER, 9 for GROWTH, 9999 for ENTERPRISE
  featureEntitlements: {
    maxProjects?: number;
    maxSites?: number;
    advancedAnalytics: boolean;
    complianceExports: boolean;
    weeklyEmailReports: boolean;
    conflictResolution: boolean;
    customSeatCapacity: boolean;
  };
  razorpayPlanIds: {
    monthly?: string;
    annual?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    planCode: {
      type: String,
      required: true,
      enum: ['STARTER', 'GROWTH', 'ENTERPRISE'],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    monthlyPricePaise: {
      type: Number,
      required: true,
      default: 0,
    },
    annualPricePaise: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    minSupervisorSeats: {
      type: Number,
      default: 1,
    },
    maxSupervisorSeats: {
      type: Number,
      required: true,
      default: 3,
    },
    featureEntitlements: {
      maxProjects: { type: Number, default: 5 },
      maxSites: { type: Number, default: 15 },
      advancedAnalytics: { type: Boolean, default: false },
      complianceExports: { type: Boolean, default: false },
      weeklyEmailReports: { type: Boolean, default: false },
      conflictResolution: { type: Boolean, default: true },
      customSeatCapacity: { type: Boolean, default: false },
    },
    razorpayPlanIds: {
      monthly: String,
      annual: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SubscriptionPlan = mongoose.model<ISubscriptionPlan>(
  'SubscriptionPlan',
  SubscriptionPlanSchema
);
