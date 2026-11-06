import mongoose, { Schema } from 'mongoose';

const CampusRequestSchema = new Schema(
  {
    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    approxStudents: {
      type: Schema.Types.Mixed,
    },
    preferredFormat: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      maxlength: 1000,
    },
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
    source: {
      type: String,
      maxlength: 40,
      trim: true,
    },
    pagePath: {
      type: String,
      trim: true,
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

CampusRequestSchema.index({ createdAt: -1 });

export const CampusRequest = mongoose.models.CampusRequest ||
  mongoose.model('CampusRequest', CampusRequestSchema, 'campus_requests');
