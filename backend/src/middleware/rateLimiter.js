import { getRedis } from '../lib/redis.js';
import { RateLimitError } from './errorHandler.js';
import { logger } from '../lib/logger.js';

/**
 * Rate limiting middleware using Redis
 * Implements sliding window algorithm for accurate rate limiting
 * 
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests allowed in window
 * @param {string} options.keyPrefix - Prefix for Redis keys
 * @param {Function} options.keyGenerator - Function to generate rate limit key from request
 * @returns {Function} Express middleware function
 */
export const rateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute default
    maxRequests = 100,
    keyPrefix = 'ratelimit',
    keyGenerator = (req) => req.ip || 'unknown',
  } = options;

  return async (req, res, next) => {
    const redis = getRedis();

    // If Redis is not available, skip rate limiting but log warning
    if (!redis) {
      logger.warn('Rate limiting skipped: Redis not available');
      return next();
    }

    try {
      const identifier = keyGenerator(req);
      const key = `${keyPrefix}:${identifier}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Use Redis sorted set for sliding window
      const multi = redis.multi();

      // Remove old entries outside the window
      multi.zremrangebyscore(key, 0, windowStart);

      // Add current request
      multi.zadd(key, now, `${now}-${Math.random()}`);

      // Count requests in current window
      multi.zcard(key);

      // Set expiration on the key
      multi.expire(key, Math.ceil(windowMs / 1000));

      const results = await multi.exec();

      // Get count from the zcard result
      const count = results[2][1];

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      if (count > maxRequests) {
        logger.warn(
          { identifier, count, maxRequests, requestId: req.id },
          'Rate limit exceeded'
        );
        throw new RateLimitError(
          `Too many requests. Please try again in ${Math.ceil(windowMs / 1000)} seconds.`
        );
      }

      next();
    } catch (error) {
      if (error instanceof RateLimitError) {
        next(error);
      } else {
        // Log Redis errors but don't block requests
        logger.error({ error, requestId: req.id }, 'Rate limiter error');
        next();
      }
    }
  };
};

/**
 * Predefined rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict rate limit for authentication endpoints
  auth: rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: 'ratelimit:auth',
    keyGenerator: (req) => `${req.ip}:${req.body?.email || 'unknown'}`,
  }),

  // Standard API rate limit
  api: rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: 'ratelimit:api',
  }),

  // Generous rate limit for file downloads
  download: rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyPrefix: 'ratelimit:download',
    keyGenerator: (req) => `${req.user?.id || req.ip}`,
  }),

  // Strict rate limit for file uploads
  upload: rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    keyPrefix: 'ratelimit:upload',
    keyGenerator: (req) => req.user?.id || req.ip,
  }),

  // Payment endpoints need stricter limits
  payment: rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    keyPrefix: 'ratelimit:payment',
    keyGenerator: (req) => req.user?.id || req.ip,
  }),
};
