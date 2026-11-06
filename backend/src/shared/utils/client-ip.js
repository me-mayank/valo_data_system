import { env } from '../../config/env.js';

/**
 * Derives client IP address taking into account the configured number of proxy hops.
 * @param {import('express').Request} req
 * @returns {string}
 */
export function getClientIp(req) {
  const xForwardedFor = req.headers['x-forwarded-for'];

  if (typeof xForwardedFor === 'string' && xForwardedFor.trim()) {
    const ips = xForwardedFor.split(',').map((ip) => ip.trim());
    const hops = env.TRUST_PROXY_HOPS || 1;
    // Calculate client IP index from the end according to trusted hops
    const targetIndex = Math.max(0, ips.length - hops);
    if (ips[targetIndex]) {
      return ips[targetIndex];
    }
  }

  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

