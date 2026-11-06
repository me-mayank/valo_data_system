import mongoose, { Schema } from 'mongoose';

const LeadSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    courseYear: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    // IDs only; no cross-module ref/populate per modular-monolith rules
    interestedCourseIds: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    consent: {
      type: Boolean,
      required: true,
      validate: {
        validator: (v) => v === true,
        message: 'Consent must be explicitly accepted',
      },
    },
    consentAt: {
      type: Date,
      default: Date.now,
    },
    city: { type: String, trim: true },
    preferredMode: { type: String, trim: true },
    skillLevel: { type: String, trim: true },
    heardFrom: { type: String, trim: true },
    source: { type: String, maxlength: 40, trim: true },
    pagePath: { type: String, trim: true },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
    },
    formVariant: {
      type: String,
      enum: ['popup', 'contact'],
      default: 'popup',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ email: 1 });
LeadSchema.index({ phone: 1 });
LeadSchema.index({ source: 1 });

export const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema, 'leads');

