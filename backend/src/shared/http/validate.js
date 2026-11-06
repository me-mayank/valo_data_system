import { ValidationError } from '../errors/index.js';

/**
 * Validates request data against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} [source='body']
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    /** @type {Record<string, string>} */
    const fields = {};

    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || 'root';
      fields[path] = issue.message;
    }

    return next(new ValidationError('Validation failed', fields));
  }

  // Assign parsed and sanitized data back to req
  req[source] = result.data;
  next();
};

export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
export const validateParams = (schema) => validate(schema, 'params');
