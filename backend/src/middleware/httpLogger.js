import pinoHttp from 'pino-http';
import { logger } from '../lib/logger.js';

/**
 * HTTP request/response logger middleware using Pino
 */
export const httpLogger = pinoHttp({
  logger,
  
  // Customize log level based on response status
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 400) {
      return 'warn';
    }
    if (res.statusCode >= 300) {
      return 'info';
    }
    return 'info';
  },

  // Custom success message
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed`;
  },

  // Custom error message
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed: ${err.message}`;
  },

  // Customize request/response serialization
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      remoteAddress: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.raw?.user?.id,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },

  // Don't log health check endpoints to reduce noise
  autoLogging: {
    ignore: (req) => {
      return req.url === '/health-check' || req.url === '/health';
    },
  },
});
