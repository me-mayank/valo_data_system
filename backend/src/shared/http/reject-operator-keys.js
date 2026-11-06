import { AppError } from '../errors/index.js';

/**
 * Recursively scans an object for keys starting with '$' or containing '.'.
 * @param {unknown} value
 * @returns {boolean}
 */
export function hasOperatorKeys(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasOperatorKeys(item));
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      return true;
    }
    if (typeof value[key] === 'object' && value[key] !== null) {
      if (hasOperatorKeys(value[key])) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Middleware that rejects any request containing Mongo operator characters ($ or .) in body, query, or params.
 * @type {import('express').RequestHandler}
 */
export function rejectOperatorKeys(req, res, next) {
  if (
    hasOperatorKeys(req.body) ||
    hasOperatorKeys(req.query) ||
    hasOperatorKeys(req.params)
  ) {
    return next(
      new AppError(
        'Request keys starting with "$" or containing "." are not allowed',
        400,
        'INVALID_OPERATOR_KEYS'
      )
    );
  }
  next();
}

