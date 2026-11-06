import { RateLimitEvent } from './rate-limit-event.model.js';
import { RateLimitError } from '../errors/index.js';

/**
 * Checks and records rate-limit occurrences for an IP hash and route.
 * @param {{
 *   ipHash: string,
 *   route: string,
 *   maxRequests: number,
 *   windowMs: number
 * }} params
 * @returns {Promise<{ allowed: boolean, remaining: number }>}
 */
export async function checkRateLimit({ ipHash, route, maxRequests, windowMs }) {
  const since = new Date(Date.now() - windowMs);

  const count = await RateLimitEvent.countDocuments({
    ipHash,
    route,
    createdAt: { $gte: since },
  });

  if (count >= maxRequests) {
    throw new RateLimitError();
  }

  await RateLimitEvent.create({ ipHash, route });

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - count - 1),
  };
}

