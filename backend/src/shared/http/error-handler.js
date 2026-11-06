import { logger } from '../logger.js';
import { AppError } from '../errors/index.js';

/**
 * Global Express error handling middleware. Formats errors to the standard API error envelope.
 * @type {import('express').ErrorRequestHandler}
 */
export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected server error occurred';
  /** @type {Record<string, string> | undefined} */
  let fields;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    fields = err.fields;
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    fields = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.') || 'root';
      fields[path] = issue.message;
    }
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    errorCode = 'CONFLICT';
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
  } else if (err.name === 'ValidationError') {
    // Mongoose schema validation error
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    fields = {};
    for (const key of Object.keys(err.errors)) {
      fields[key] = err.errors[key].message;
    }
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_IDENTIFIER';
    message = `Invalid format for parameter: ${err.path}`;
  }

  // Log internal unexpected errors
  if (statusCode >= 500) {
    logger.error(
      {
        err,
        route: req.originalUrl,
        method: req.method,
      },
      'Unhandled internal error'
    );
  } else {
    logger.debug(
      {
        code: errorCode,
        message,
        fields,
        route: req.originalUrl,
        method: req.method,
      },
      'Handled operational error'
    );
  }

  res.status(statusCode).json({
    ok: false,
    error: {
      code: errorCode,
      message,
      ...(fields ? { fields } : {}),
    },
  });
}
