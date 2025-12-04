/**
 * Rate Limiting Configuration
 * Prevents abuse and ensures fair usage
 */

const rateLimitConfig = {
  // API Rate Limiting
  api: {
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100, // Max requests per window
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    }
  },

  // WhatsApp Message Rate Limiting (Anti-ban)
  whatsapp: {
    maxPerMinute: parseInt(process.env.MAX_MESSAGES_PER_MINUTE) || 20,
    maxPerHour: parseInt(process.env.MAX_MESSAGES_PER_HOUR) || 100,
    maxPerDay: parseInt(process.env.MAX_MESSAGES_PER_DAY) || 500,
    delayMin: parseInt(process.env.MESSAGE_DELAY_MIN) || 2000, // 2 seconds
    delayMax: parseInt(process.env.MESSAGE_DELAY_MAX) || 5000  // 5 seconds
  },

  // AI API Rate Limiting
  ai: {
    claude: {
      maxPerMinute: 50,
      maxPerDay: 1000
    },
    gemini: {
      maxPerMinute: 60,
      maxPerDay: 1500
    },
    groq: {
      maxPerMinute: 30,
      maxPerDay: 14400
    },
    cohere: {
      maxPerMinute: 20,
      maxPerDay: 1000
    }
  }
};

module.exports = rateLimitConfig;
