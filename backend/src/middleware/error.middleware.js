/**
 * Error Handling Middleware
 * Centralized error handling
 */

const { logger } = require('../utils/logger');
const { formatErrorResponse, isOperationalError } = require('../utils/error-handler');

/**
 * 404 Not Found handler
 */
function notFound(req, res, next) {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error
  if (statusCode >= 500) {
    logger.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      user: req.user?.id
    });
  } else {
    logger.warn('Client Error:', {
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      statusCode
    });
  }

  // Format error response
  const response = formatErrorResponse(err, !isProduction);

  // Send response
  res.status(statusCode).json(response);

  // Log unhandled errors in production
  if (!isOperationalError(err) && isProduction) {
    logger.error('Unhandled Error - Server might need restart:', err);
  }
}

/**
 * Async error wrapper
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  notFound,
  errorHandler,
  asyncHandler
};
