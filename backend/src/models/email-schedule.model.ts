import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEmailSchedule extends Document {
  organizationId: string;
  isEnabled: boolean;
  recipients: string[];
  projectIds?: Types.ObjectId[];
  metrics: string[];
  deliveryDay: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  deliveryTime: string; // "09:00"
  timezone: string; // "Asia/Kolkata"
  lastSentAt?: Date;
  history: Array<{
    sentAt: Date;
    recipientCount: number;
    status: 'SUCCESS' | 'FAILED';
    summary?: string;
    errorReason?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const EmailScheduleSchema = new Schema<IEmailSchedule>(
  {
    organizationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    recipients: {
      type: [String],
      default: [],
    },
    projectIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
    metrics: {
      type: [String],
      default: ['COMPLIANCE_SCORE', 'SUBMITTED_INSPECTIONS', 'CRITICAL_RISKS', 'SITE_FAILURES'],
    },
    deliveryDay: {
      type: String,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      default: 'MONDAY',
    },
    deliveryTime: {
      type: String,
      default: '09:00',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    lastSentAt: Date,
    history: [
      {
        sentAt: { type: Date, default: Date.now },
        recipientCount: Number,
        status: { type: String, enum: ['SUCCESS', 'FAILED'] },
        summary: String,
        errorReason: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const EmailSchedule = mongoose.model<IEmailSchedule>(
  'EmailSchedule',
  EmailScheduleSchema
);
