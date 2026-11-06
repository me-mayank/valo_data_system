export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {string} [errorCode='INTERNAL_ERROR']
   * @param {Record<string, string>} [fields]
   */
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', fields = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.fields = fields;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

