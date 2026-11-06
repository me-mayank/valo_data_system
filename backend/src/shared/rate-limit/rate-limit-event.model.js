import mongoose, { Schema } from 'mongoose';

const RateLimitEventSchema = new Schema(
  {
    ipHash: { type: String, required: true },
    route: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Query index for rate limit window queries
RateLimitEventSchema.index({ ipHash: 1, route: 1, createdAt: -1 });

// TTL index to automatically purge records after 24 hours (86400 seconds)
RateLimitEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const RateLimitEvent = mongoose.models.RateLimitEvent ||
  mongoose.model('RateLimitEvent', RateLimitEventSchema, 'rate_limit_events');

