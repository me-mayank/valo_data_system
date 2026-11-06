import crypto from 'crypto';
import { env } from '../../config/env.js';

/**
 * Hashes an IP address using HMAC-SHA256 with the server-side secret.
 * Raw IP addresses are NEVER stored in database collections.
 * @param {string} ip
 * @param {string} [secret=env.IP_HASH_SECRET]
 * @returns {string} 64-character hexadecimal hash
 */
export function hashIp(ip, secret = env.IP_HASH_SECRET) {
  if (!ip || typeof ip !== 'string') {
    return crypto.createHmac('sha256', secret).update('unknown').digest('hex');
  }
  return crypto.createHmac('sha256', secret).update(ip.trim()).digest('hex');
}

