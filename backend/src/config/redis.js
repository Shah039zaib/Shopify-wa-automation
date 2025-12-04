/**
 * Redis Configuration (Optional - for caching)
 * Used for session storage and rate limiting
 */

const { logger } = require('../utils/logger');

let redisClient = null;

// Only initialize Redis if enabled and URL is provided
if (process.env.ENABLE_REDIS === 'true' && process.env.REDIS_URL) {
  const redis = require('redis');

  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD || undefined,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('Redis reconnection failed after 10 attempts');
          return new Error('Redis reconnection failed');
        }
        return retries * 100; // Exponential backoff
      }
    }
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis error:', err);
  });

  redisClient.on('reconnecting', () => {
    logger.info('Redis reconnecting...');
  });

  // Connect to Redis
  (async () => {
    try {
      await redisClient.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      redisClient = null;
    }
  })();
}

/**
 * Cache helper functions
 */
const cache = {
  /**
   * Get value from cache
   */
  async get(key) {
    if (!redisClient) return null;
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Set value in cache
   */
  async set(key, value, ttl = 3600) {
    if (!redisClient) return false;
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  },

  /**
   * Delete from cache
   */
  async del(key) {
    if (!redisClient) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!redisClient) return false;
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  },

  /**
   * Increment counter
   */
  async incr(key) {
    if (!redisClient) return 0;
    try {
      return await redisClient.incr(key);
    } catch (error) {
      logger.error('Cache incr error:', error);
      return 0;
    }
  },

  /**
   * Set expiry on key
   */
  async expire(key, seconds) {
    if (!redisClient) return false;
    try {
      await redisClient.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error('Cache expire error:', error);
      return false;
    }
  }
};

module.exports = {
  redisClient,
  cache
};
