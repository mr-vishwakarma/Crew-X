import mongoose, { Document, Schema, Types } from 'mongoose';
import { PlanCode } from './subscription-plan.model.js';

export type SubscriptionStatus =
  | 'CREATED'
  | 'PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'GRACE_PERIOD'
  | 'HALTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type BillingInterval = 'MONTHLY' | 'ANNUAL';

export interface IOrganizationSubscription extends Document {
  organizationId: string;
  planCode: PlanCode;
  internalPlanId?: Types.ObjectId;
  razorpaySubscriptionId?: string;
  razorpayPlanId?: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  amountPaise: number;
  currency: string;
  activeSupervisorSeats: number;
  maxSupervisorSeats: number;
  startAt?: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  nextChargeAt?: Date;
  gracePeriodEndsAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  lastPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSubscriptionSchema = new Schema<IOrganizationSubscription>(
  {
    organizationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    planCode: {
      type: String,
      enum: ['STARTER', 'GROWTH', 'ENTERPRISE'],
      required: true,
      default: 'STARTER',
      index: true,
    },
    internalPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
    },
    razorpaySubscriptionId: {
      type: String,
      index: true,
      sparse: true,
    },
    razorpayPlanId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'CREATED',
        'PENDING_ACTIVATION',
        'ACTIVE',
        'PAST_DUE',
        'GRACE_PERIOD',
        'HALTED',
        'CANCELLED',
        'EXPIRED',
      ],
      default: 'ACTIVE', // Default new organizations to active starter trial
      index: true,
    },
    billingInterval: {
      type: String,
      enum: ['MONTHLY', 'ANNUAL'],
      default: 'MONTHLY',
    },
    amountPaise: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    activeSupervisorSeats: {
      type: Number,
      default: 1,
    },
    maxSupervisorSeats: {
      type: Number,
      default: 3,
    },
    startAt: {
      type: Date,
      default: Date.now,
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    nextChargeAt: Date,
    gracePeriodEndsAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    lastPaymentId: String,
  },
  {
    timestamps: true,
  }
);

export const OrganizationSubscription = mongoose.model<IOrganizationSubscription>(
  'OrganizationSubscription',
  OrganizationSubscriptionSchema
);
