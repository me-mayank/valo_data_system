import crypto from 'node:crypto';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/index.js';
import { logger } from '../../shared/logger.js';

/**
 * Computes Cloudinary request signature using standard SHA-1 parameter signing.
 * @param {Record<string, string | number>} params
 * @param {string} apiSecret
 * @returns {string}
 */
export function generateSignature(params, apiSecret) {
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(serialized + apiSecret).digest('hex');
}

export class UploadsService {
  isConfigured() {
    return Boolean(
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
    );
  }

  /**
   * Generates signed parameters for direct-to-Cloudinary image upload.
   * Restricted to JPG/PNG/WebP, max 2 MB.
   * Returns 501 AppError when Cloudinary is not configured.
   */
  async signUpload() {
    if (!this.isConfigured()) {
      throw new AppError(
        'Image upload service is not configured on this server.',
        501,
        'NOT_IMPLEMENTED'
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'datavalo/courses';
    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = generateSignature(paramsToSign, env.CLOUDINARY_API_SECRET);

    return {
      timestamp,
      signature,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
      allowedFormats: ['jpg', 'png', 'webp'],
      maxFileSize: 2 * 1024 * 1024, // 2 MB
    };
  }

  /**
   * Deletes an image from Cloudinary by its publicId.
   * Safe execution: logs on error, never throws.
   * @param {string} publicId
   */
  async deleteImage(publicId) {
    if (!publicId) return;

    if (!this.isConfigured()) {
      logger.warn({ publicId }, 'Cloudinary credentials missing; skipped image deletion');
      return;
    }

    try {
      const timestamp = Math.round(Date.now() / 1000);
      const signature = generateSignature(
        { public_id: publicId, timestamp },
        env.CLOUDINARY_API_SECRET
      );

      const url = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: publicId,
          timestamp,
          api_key: env.CLOUDINARY_API_KEY,
          signature,
        }),
      });

      if (!res.ok) {
        logger.error({ status: res.status, publicId }, 'Cloudinary image destroy failed');
      } else {
        logger.info({ publicId }, 'Deleted image from Cloudinary');
      }
    } catch (err) {
      logger.error({ err: err.message, publicId }, 'Failed to delete image from Cloudinary');
    }
  }
}

export const uploadsService = new UploadsService();
