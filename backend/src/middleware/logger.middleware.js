/**
 * HTTP Request Logger Middleware
 * Logs incoming HTTP requests
 */

const morgan = require('morgan');
const { logger } = require('../utils/logger');

/**
 * Custom token for user ID
 */
morgan.token('user-id', (req) => {
  return req.user?.id || 'anonymous';
});

/**
 * Custom token for response time in ms
 */
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '';
  }

  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
             (res._startAt[1] - req._startAt[1]) * 1e-6;

  return ms.toFixed(3);
});

/**
 * Custom format for logging
 */
const logFormat = ':method :url :status :response-time-ms ms - :user-id - :remote-addr';

/**
 * Stream object for Winston
 */
const stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

/**
 * Morgan middleware configuration
 */
const logRequest = morgan(logFormat, {
  stream,
  skip: (req, res) => {
    // Skip health check logs to reduce noise
    return req.path === '/health' || req.path === '/api/health';
  }
});

/**
 * Detailed request logger (for debugging)
 */
function detailedLogger(req, res, next) {
  const start = Date.now();

  // Log request
  logger.debug('Incoming Request:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    user: req.user?.id,
    body: req.method === 'POST' || req.method === 'PUT' ? 
      sanitizeBody(req.body) : undefined
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.debug('Response Sent:', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      user: req.user?.id
    });
  });

  next();
}

/**
 * Sanitize request body (remove sensitive data from logs)
 */
function sanitizeBody(body) {
  if (!body) return body;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'api_key', 'token', 'secret'];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

module.exports = {
  logRequest,
  detailedLogger
};
