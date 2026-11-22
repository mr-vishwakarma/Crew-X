import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBillingEvent extends Document {
  organizationId: string;
  subscriptionId?: Types.ObjectId | string;
  paymentId?: string;
  razorpayOrderId?: string;
  eventType:
    | 'SUBSCRIPTION_CREATED'
    | 'PAYMENT_AUTHORIZED'
    | 'PAYMENT_CAPTURED'
    | 'PAYMENT_FAILED'
    | 'SUBSCRIPTION_CHARGED'
    | 'SUBSCRIPTION_HALTED'
    | 'SUBSCRIPTION_CANCELLED'
    | 'REFUND_PROCESSED';
  amountPaise: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  eventTimestamp: Date;
  invoiceUrl?: string;
  receiptNumber?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const BillingEventSchema = new Schema<IBillingEvent>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.Mixed,
      index: true,
    },
    paymentId: {
      type: String,
      trim: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS',
      index: true,
    },
    eventTimestamp: {
      type: Date,
      default: Date.now,
    },
    invoiceUrl: String,
    receiptNumber: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable ledger
  }
);

BillingEventSchema.index({ organizationId: 1, eventTimestamp: -1 });

export const BillingEvent = mongoose.model<IBillingEvent>('BillingEvent', BillingEventSchema);
