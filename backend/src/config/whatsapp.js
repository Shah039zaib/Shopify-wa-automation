/**
 * WhatsApp Configuration
 * Settings for WhatsApp Web.js client
 */

const path = require('path');

const whatsappConfig = {
  // Session configuration
  sessionPath: process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth',
  
  // Puppeteer configuration
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
  },

  // Client options
  clientOptions: {
    restartOnAuthFail: true,
    takeoverOnConflict: true,
    takeoverTimeoutMs: 0,
    qrMaxRetries: 5,
    authTimeoutMs: parseInt(process.env.WHATSAPP_TIMEOUT) || 60000,
  },

  // Rate limiting (anti-ban protection)
  rateLimits: {
    maxMessagesPerMinute: parseInt(process.env.MAX_MESSAGES_PER_MINUTE) || 20,
    maxMessagesPerHour: parseInt(process.env.MAX_MESSAGES_PER_HOUR) || 100,
    maxMessagesPerDay: parseInt(process.env.MAX_MESSAGES_PER_DAY) || 500,
    delayMin: parseInt(process.env.MESSAGE_DELAY_MIN) || 2000,
    delayMax: parseInt(process.env.MESSAGE_DELAY_MAX) || 5000
  },

  // Retry configuration
  retry: {
    maxRetries: parseInt(process.env.WHATSAPP_MAX_RETRY) || 3,
    retryDelay: 5000
  },

  // Business hours (optional)
  businessHours: {
    enabled: process.env.BUSINESS_HOURS_ENABLED === 'true',
    start: process.env.BUSINESS_HOURS_START || '09:00',
    end: process.env.BUSINESS_HOURS_END || '18:00',
    timezone: process.env.BUSINESS_TIMEZONE || 'Asia/Karachi'
  }
};

module.exports = whatsappConfig;
