/**
 * Rate Limiting Middleware
 * API request rate limiting
 */

const rateLimit = require('express-rate-limit');
const rateLimitConfig = require('../config/rate-limit');

/**
 * General API rate limiter
 */
const apiRateLimit = rateLimit({
  windowMs: rateLimitConfig.api.windowMs,
  max: rateLimitConfig.api.max,
  message: rateLimitConfig.api.message,
  standardHeaders: rateLimitConfig.api.standardHeaders,
  legacyHeaders: rateLimitConfig.api.legacyHeaders,
  skip: rateLimitConfig.api.skip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter: Math.ceil(rateLimitConfig.api.windowMs / 1000 / 60) + ' minutes'
    });
  }
});

/**
 * Strict rate limiter for sensitive endpoints (login, register)
 */
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'Too many attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many attempts, please try again after 15 minutes'
    });
  }
});

/**
 * Lenient rate limiter for public endpoints
 */
const lenientRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please slow down'
    });
  }
});

/**
 * Custom rate limiter factory
 */
function createRateLimiter(options = {}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
    skip: options.skip,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: options.message || 'Too many requests, please try again later'
      });
    }
  });
}

module.exports = {
  apiRateLimit,
  strictRateLimit,
  lenientRateLimit,
  createRateLimiter
};
