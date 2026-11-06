import mongoose, { Schema } from 'mongoose';

const SiteSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'main',
    },
    popupEnabled: {
      type: Boolean,
      default: true,
    },
    popupDelaySeconds: {
      type: Number,
      default: 8,
      min: 0,
      max: 120,
    },
    popupScrollPercent: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },
    popupReappearSeconds: {
      type: Number,
      default: 120,
      min: 0,
      max: 3600,
    },
    popupMaxDismissals: {
      type: Number,
      default: 5,
      min: 1,
      max: 50,
    },
    contactEmail: {
      type: String,
      default: 'info@datavalosystem.com',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
      trim: true,
    },
    instagramUrl: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const SiteSettings = mongoose.models.SiteSettings ||
  mongoose.model('SiteSettings', SiteSettingsSchema, 'site_settings');

