import mongoose, { Schema } from 'mongoose';

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      maxlength: 160,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 12,
    },
    overview: {
      type: String,
    },
    syllabus: [
      {
        title: { type: String, required: true },
        topics: [{ type: String }],
      },
    ],
    category: {
      type: String,
      trim: true,
    },
    tools: [
      {
        type: String,
        trim: true,
      },
    ],
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'online',
    },
    duration: {
      type: String,
      trim: true,
    },
    audience: {
      type: String,
    },
    fee: {
      type: Number,
    },
    thumbnail: {
      url: { type: String },
      publicId: { type: String },
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

CourseSchema.index({ status: 1, sortOrder: 1 });
CourseSchema.index({ status: 1, featured: 1 });

export const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema, 'courses');

