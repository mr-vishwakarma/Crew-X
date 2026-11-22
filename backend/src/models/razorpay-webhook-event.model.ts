import mongoose, { Document, Schema } from 'mongoose';

export interface IRazorpayWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  receivedAt: Date;
  processedAt?: Date;
  processingStatus: 'PENDING' | 'PROCESSED' | 'FAILED' | 'IGNORED';
  signatureVerified: boolean;
  payloadReference?: Record<string, any>;
  errorReason?: string;
  createdAt: Date;
}

const RazorpayWebhookEventSchema = new Schema<IRazorpayWebhookEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: Date,
    processingStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'FAILED', 'IGNORED'],
      default: 'PENDING',
      index: true,
    },
    signatureVerified: {
      type: Boolean,
      default: true,
    },
    payloadReference: {
      type: Schema.Types.Mixed,
      default: {},
    },
    errorReason: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const RazorpayWebhookEvent = mongoose.model<IRazorpayWebhookEvent>(
  'RazorpayWebhookEvent',
  RazorpayWebhookEventSchema
);
