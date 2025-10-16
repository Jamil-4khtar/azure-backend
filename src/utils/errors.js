/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true, code = null) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.timestamp = new Date().toISOString();
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND_ERROR');
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, true, 'CONFLICT_ERROR');
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', retryAfter = null) {
    super(message, 429, true, 'RATE_LIMIT_ERROR');
    this.retryAfter = retryAfter;
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, true, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
  constructor(message = 'External service unavailable', service = null) {
    super(message, 502, true, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

/**
 * Service unavailable error (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, true, 'SERVICE_UNAVAILABLE_ERROR');
  }
}

/**
 * Helper function to create validation error with Joi details
 */
export function createValidationError(joiError) {
  const details = joiError.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message,
    value: detail.context.value
  }));
  
  return new ValidationError('Validation failed', details);
}

/**
 * Helper function to handle Prisma errors
 */
export function handlePrismaError(error) {
  // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
  switch (error.code) {
    case 'P2002':
      return new ConflictError('A record with this data already exists');
    case 'P2025':
      return new NotFoundError('Record not found');
    case 'P2003':
      return new ValidationError('Foreign key constraint failed');
    case 'P2014':
      return new ValidationError('Invalid data provided');
    case 'P1001':
      return new DatabaseError('Database server unreachable');
    case 'P1002':
      return new DatabaseError('Database connection timeout');
    default:
      return new DatabaseError(`${error.message}`, error);
  }
}

/**
 * Helper function to check if error is operational
 */
export function isOperationalError(error) {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}
