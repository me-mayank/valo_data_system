import { env } from '../../config/env.js';
import { ForbiddenError } from '../errors/index.js';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Normalizes a URL string to its origin (protocol + host).
 * @param {string} urlString
 * @returns {string|null}
 */
function getOrigin(urlString) {
  try {
    return new URL(urlString).origin;
  } catch {
    return null;
  }
}

/**
 * Middleware enforcing that state-changing requests originate from the allowed FRONTEND_ORIGIN.
 * @type {import('express').RequestHandler}
 */
export function originCheck(req, res, next) {
  if (!STATE_CHANGING_METHODS.has(req.method.toUpperCase())) {
    return next();
  }

  const allowedOrigin = new URL(env.FRONTEND_ORIGIN).origin;
  const originHeader = req.headers.origin;
  const refererHeader = req.headers.referer;

  const requestOrigin = originHeader
    ? getOrigin(originHeader)
    : refererHeader
      ? getOrigin(refererHeader)
      : null;

  // If an Origin or Referer header is present and does not match allowed origin, reject
  if (requestOrigin && requestOrigin !== allowedOrigin) {
    return next(
      new ForbiddenError('Request origin is not allowed', 'FORBIDDEN_ORIGIN')
    );
  }

  // In production, reject state-changing browser requests that omit both Origin and Referer
  if (env.NODE_ENV === 'production' && !requestOrigin) {
    return next(
      new ForbiddenError('Missing request origin header', 'FORBIDDEN_ORIGIN')
    );
  }

  next();
}

