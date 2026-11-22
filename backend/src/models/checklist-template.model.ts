import mongoose, { Document, Schema, Model } from 'mongoose';

export type AnswerType =
  | 'COMPLIANT_DEFECT_NA'
  | 'YES_NO_NA'
  | 'TEXT'
  | 'NUMBER'
  | 'SINGLE_CHOICE';

export interface IChecklistQuestion {
  id: string;
  category: string;
  question: string;
  description: string;
  answerType: AnswerType;
  options?: string[];
  isMandatory: boolean;
  evidenceRequired: boolean; // whether photo evidence is required on non-compliance
  locationRequired: boolean;
}

export interface IChecklistSection {
  id: string;
  title: string;
  description?: string;
  questions: IChecklistQuestion[];
}

export interface IChecklistTemplateDocument extends Document {
  templateCode: string;
  title: string;
  version: number;
  industry: string;
  organizationId: string;
  isPublished: boolean;
  sections: IChecklistSection[];
  createdAt: Date;
  updatedAt: Date;
}

const checklistQuestionSchema = new Schema<IChecklistQuestion>(
  {
    id: { type: String, required: true },
    category: { type: String, required: true },
    question: { type: String, required: true },
    description: { type: String, default: '' },
    answerType: {
      type: String,
      enum: ['COMPLIANT_DEFECT_NA', 'YES_NO_NA', 'TEXT', 'NUMBER', 'SINGLE_CHOICE'],
      default: 'COMPLIANT_DEFECT_NA',
    },
    options: [{ type: String }],
    isMandatory: { type: Boolean, default: true },
    evidenceRequired: { type: Boolean, default: true },
    locationRequired: { type: Boolean, default: false },
  },
  { _id: false }
);

const checklistSectionSchema = new Schema<IChecklistSection>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    questions: [checklistQuestionSchema],
  },
  { _id: false }
);

const checklistTemplateSchema = new Schema<IChecklistTemplateDocument>(
  {
    templateCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    industry: {
      type: String,
      default: 'Construction & Civil Engineering',
    },
    organizationId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    sections: [checklistSectionSchema],
  },
  { timestamps: true }
);

checklistTemplateSchema.index({ organizationId: 1, templateCode: 1, version: 1 });

export const ChecklistTemplate: Model<IChecklistTemplateDocument> =
  mongoose.model<IChecklistTemplateDocument>('ChecklistTemplate', checklistTemplateSchema);
