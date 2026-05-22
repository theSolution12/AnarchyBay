import Redis from 'ioredis';
import { logger } from './logger.js';

let redisClient = null;

/**
 * Initialize Redis connection
 * @returns {Redis} Redis client instance
 */
export const initRedis = () => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    logger.warn('REDIS_URL not configured. Redis features will be disabled.');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      }
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      logger.error({ err }, 'Redis connection error');
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });

    return redisClient;
  } catch (error) {
    logger.error({ error }, 'Failed to initialize Redis');
    return null;
  }
};

/**
 * Get Redis client instance
 * @returns {Redis|null} Redis client or null if not initialized
 */
export const getRedis = () => {
  return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
};
