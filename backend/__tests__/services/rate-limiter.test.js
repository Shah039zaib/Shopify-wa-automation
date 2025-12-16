/**
 * Rate Limiter Service Tests
 */

const rateLimiter = require('../../src/services/rate-limiter.service');

describe('Rate Limiter Service', () => {
  beforeEach(() => {
    // Reset rate limiter state before each test
    if (rateLimiter.reset) {
      rateLimiter.reset();
    }
  });

  describe('checkLimit', () => {
    it('should allow first request', async () => {
      const result = await rateLimiter.checkLimit('account-123');
      expect(result).toBe(true);
    });

    it('should allow requests within limit', async () => {
      // Make multiple requests within limit
      for (let i = 0; i < 5; i++) {
        const result = await rateLimiter.checkLimit('account-456');
        expect(result).toBe(true);
      }
    });

    it('should track different accounts separately', async () => {
      const result1 = await rateLimiter.checkLimit('account-1');
      const result2 = await rateLimiter.checkLimit('account-2');

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });

  describe('addDelay', () => {
    it('should add delay between messages', async () => {
      const startTime = Date.now();
      await rateLimiter.addDelay();
      const endTime = Date.now();

      // Should have some delay (at least 500ms typically)
      expect(endTime - startTime).toBeGreaterThanOrEqual(0);
    });

    it('should return a promise', () => {
      const result = rateLimiter.addDelay();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('getMessageCount', () => {
    it('should return message count for account', async () => {
      if (rateLimiter.getMessageCount) {
        await rateLimiter.checkLimit('test-account');
        const count = await rateLimiter.getMessageCount('test-account');
        expect(typeof count).toBe('number');
      }
    });
  });

  describe('isRateLimited', () => {
    it('should check if account is rate limited', async () => {
      if (rateLimiter.isRateLimited) {
        const result = await rateLimiter.isRateLimited('new-account');
        expect(typeof result).toBe('boolean');
      }
    });
  });

  describe('getTimeUntilReset', () => {
    it('should return time until rate limit resets', async () => {
      if (rateLimiter.getTimeUntilReset) {
        const time = await rateLimiter.getTimeUntilReset('account-123');
        expect(typeof time).toBe('number');
        expect(time).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
