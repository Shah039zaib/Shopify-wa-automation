/**
 * Rate Limiter Service
 * Manages WhatsApp message rate limiting to avoid bans
 */

const { logger } = require('../utils/logger');

// Store rate limit data in memory (use Redis in production)
const rateLimitStore = new Map();

// Configuration
const config = {
  maxMessagesPerMinute: parseInt(process.env.MAX_MESSAGES_PER_MINUTE) || 20,
  maxMessagesPerHour: parseInt(process.env.MAX_MESSAGES_PER_HOUR) || 200,
  maxMessagesPerDay: parseInt(process.env.MAX_MESSAGES_PER_DAY) || 1000,
  messageDelayMin: parseInt(process.env.MESSAGE_DELAY_MIN) || 1000, // 1 second
  messageDelayMax: parseInt(process.env.MESSAGE_DELAY_MAX) || 3000, // 3 seconds
  cooldownPeriod: parseInt(process.env.COOLDOWN_PERIOD) || 60000, // 1 minute
  warningThreshold: 0.8 // 80% of limit
};

/**
 * Initialize rate limit data for an account
 */
function initAccount(accountId) {
  if (!rateLimitStore.has(accountId)) {
    rateLimitStore.set(accountId, {
      minuteCount: 0,
      hourCount: 0,
      dayCount: 0,
      lastMinuteReset: Date.now(),
      lastHourReset: Date.now(),
      lastDayReset: Date.now(),
      lastMessage: null,
      inCooldown: false,
      cooldownUntil: null
    });
  }
  return rateLimitStore.get(accountId);
}

/**
 * Check if account can send message
 */
async function checkLimit(accountId) {
  const data = initAccount(accountId);
  const now = Date.now();

  // Reset counters if time windows have passed
  resetCountersIfNeeded(accountId, data, now);

  // Check if in cooldown
  if (data.inCooldown) {
    if (now < data.cooldownUntil) {
      logger.warn(`Account ${accountId} is in cooldown until ${new Date(data.cooldownUntil).toISOString()}`);
      return false;
    }
    // Cooldown expired
    data.inCooldown = false;
    data.cooldownUntil = null;
  }

  // Check limits
  if (data.minuteCount >= config.maxMessagesPerMinute) {
    logger.warn(`Account ${accountId} exceeded minute limit (${data.minuteCount}/${config.maxMessagesPerMinute})`);
    enterCooldown(accountId, data);
    return false;
  }

  if (data.hourCount >= config.maxMessagesPerHour) {
    logger.warn(`Account ${accountId} exceeded hour limit (${data.hourCount}/${config.maxMessagesPerHour})`);
    return false;
  }

  if (data.dayCount >= config.maxMessagesPerDay) {
    logger.warn(`Account ${accountId} exceeded day limit (${data.dayCount}/${config.maxMessagesPerDay})`);
    return false;
  }

  // Check warning threshold
  if (data.minuteCount >= config.maxMessagesPerMinute * config.warningThreshold) {
    logger.warn(`Account ${accountId} approaching minute limit (${data.minuteCount}/${config.maxMessagesPerMinute})`);
  }

  return true;
}

/**
 * Reset counters if time windows have passed
 */
function resetCountersIfNeeded(accountId, data, now) {
  // Reset minute counter
  if (now - data.lastMinuteReset >= 60000) {
    data.minuteCount = 0;
    data.lastMinuteReset = now;
  }

  // Reset hour counter
  if (now - data.lastHourReset >= 3600000) {
    data.hourCount = 0;
    data.lastHourReset = now;
  }

  // Reset day counter
  if (now - data.lastDayReset >= 86400000) {
    data.dayCount = 0;
    data.lastDayReset = now;
  }
}

/**
 * Enter cooldown period
 */
function enterCooldown(accountId, data) {
  data.inCooldown = true;
  data.cooldownUntil = Date.now() + config.cooldownPeriod;
  logger.warn(`Account ${accountId} entering cooldown for ${config.cooldownPeriod / 1000} seconds`);
}

/**
 * Record a sent message
 */
function recordMessage(accountId) {
  const data = initAccount(accountId);
  const now = Date.now();

  resetCountersIfNeeded(accountId, data, now);

  data.minuteCount++;
  data.hourCount++;
  data.dayCount++;
  data.lastMessage = now;

  logger.info(`Account ${accountId} message count: ${data.minuteCount}/min, ${data.hourCount}/hr, ${data.dayCount}/day`);
}

/**
 * Add random delay to appear more human-like
 */
async function addDelay() {
  const delay = Math.floor(
    Math.random() * (config.messageDelayMax - config.messageDelayMin) + config.messageDelayMin
  );

  logger.info(`Adding ${delay}ms delay before sending message`);

  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Get rate limit status for account
 */
function getStatus(accountId) {
  const data = initAccount(accountId);
  const now = Date.now();

  resetCountersIfNeeded(accountId, data, now);

  return {
    accountId,
    minute: {
      count: data.minuteCount,
      limit: config.maxMessagesPerMinute,
      remaining: config.maxMessagesPerMinute - data.minuteCount,
      resetIn: Math.max(0, 60000 - (now - data.lastMinuteReset))
    },
    hour: {
      count: data.hourCount,
      limit: config.maxMessagesPerHour,
      remaining: config.maxMessagesPerHour - data.hourCount,
      resetIn: Math.max(0, 3600000 - (now - data.lastHourReset))
    },
    day: {
      count: data.dayCount,
      limit: config.maxMessagesPerDay,
      remaining: config.maxMessagesPerDay - data.dayCount,
      resetIn: Math.max(0, 86400000 - (now - data.lastDayReset))
    },
    inCooldown: data.inCooldown,
    cooldownUntil: data.cooldownUntil,
    lastMessage: data.lastMessage
  };
}

/**
 * Reset rate limits for account (admin function)
 */
function resetLimits(accountId) {
  rateLimitStore.delete(accountId);
  logger.info(`Rate limits reset for account ${accountId}`);
}

/**
 * Get all accounts rate limit status
 */
function getAllStatus() {
  const statuses = [];
  rateLimitStore.forEach((_, accountId) => {
    statuses.push(getStatus(accountId));
  });
  return statuses;
}

/**
 * Check and record message (combined operation)
 */
async function checkAndRecord(accountId) {
  const canSend = await checkLimit(accountId);
  if (canSend) {
    recordMessage(accountId);
  }
  return canSend;
}

module.exports = {
  checkLimit,
  recordMessage,
  addDelay,
  getStatus,
  resetLimits,
  getAllStatus,
  checkAndRecord,
  initAccount
};
