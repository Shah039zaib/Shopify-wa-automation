/**
 * Custom Error Classes
 * Standardized error handling
 */

/**
 * Base API Error
 */
class APIError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
class BadRequestError extends APIError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends APIError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends APIError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends APIError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

/**
 * Validation Error (422)
 */
class ValidationError extends APIError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Too Many Requests Error (429)
 */
class TooManyRequestsError extends APIError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429);
  }
}

/**
 * Internal Server Error (500)
 */
class InternalServerError extends APIError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

/**
 * Service Unavailable Error (503)
 */
class ServiceUnavailableError extends APIError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503);
  }
}

/**
 * Database Error
 */
class DatabaseError extends APIError {
  constructor(message = 'Database error occurred') {
    super(message, 500);
  }
}

/**
 * WhatsApp Error
 */
class WhatsAppError extends APIError {
  constructor(message = 'WhatsApp error occurred') {
    super(message, 500);
  }
}

/**
 * AI Provider Error
 */
class AIProviderError extends APIError {
  constructor(message = 'AI provider error occurred') {
    super(message, 500);
  }
}

/**
 * Payment Error
 */
class PaymentError extends APIError {
  constructor(message = 'Payment processing error') {
    super(message, 400);
  }
}

/**
 * Error response formatter
 */
function formatErrorResponse(error, includeStack = false) {
  const response = {
    success: false,
    message: error.message || 'An error occurred',
    status: error.status || 'error'
  };

  // Add validation errors if present
  if (error.errors && Array.isArray(error.errors)) {
    response.errors = error.errors;
  }

  // Add stack trace in development
  if (includeStack && error.stack) {
    response.stack = error.stack;
  }

  return response;
}

/**
 * Async error wrapper (catch async errors)
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Check if error is operational
 */
function isOperationalError(error) {
  if (error instanceof APIError) {
    return error.isOperational;
  }
  return false;
}

module.exports = {
  APIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
  WhatsAppError,
  AIProviderError,
  PaymentError,
  formatErrorResponse,
  asyncHandler,
  isOperationalError
};
