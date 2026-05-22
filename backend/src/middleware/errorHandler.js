import { logger } from '../lib/logger.js';

/**
 * Standard error codes for consistent error handling
 */
export const ErrorCodes = {
  // Authentication & Authorization (1xxx)
  UNAUTHORIZED: 'AUTH_1001',
  INVALID_TOKEN: 'AUTH_1002',
  TOKEN_EXPIRED: 'AUTH_1003',
  FORBIDDEN: 'AUTH_1004',
  INVALID_CREDENTIALS: 'AUTH_1005',

  // Validation (2xxx)
  VALIDATION_ERROR: 'VAL_2001',
  INVALID_INPUT: 'VAL_2002',
  MISSING_REQUIRED_FIELD: 'VAL_2003',

  // Resource (3xxx)
  NOT_FOUND: 'RES_3001',
  ALREADY_EXISTS: 'RES_3002',
  CONFLICT: 'RES_3003',

  // Business Logic (4xxx)
  BUSINESS_RULE_VIOLATION: 'BUS_4001',
  INSUFFICIENT_BALANCE: 'BUS_4002',
  LIMIT_EXCEEDED: 'BUS_4003',

  // External Services (5xxx)
  PAYMENT_PROVIDER_ERROR: 'EXT_5001',
  STORAGE_ERROR: 'EXT_5002',
  EMAIL_SERVICE_ERROR: 'EXT_5003',
  DATABASE_ERROR: 'EXT_5004',

  // Rate Limiting (6xxx)
  RATE_LIMIT_EXCEEDED: 'RATE_6001',
  TOO_MANY_REQUESTS: 'RATE_6002',

  // Internal (9xxx)
  INTERNAL_ERROR: 'INT_9001',
  SERVICE_UNAVAILABLE: 'INT_9002',
};

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = ErrorCodes.INTERNAL_ERROR, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create specific error types for common scenarios
 */
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, ErrorCodes.VALIDATION_ERROR, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, ErrorCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, ErrorCodes.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, ErrorCodes.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, ErrorCodes.CONFLICT);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, ErrorCodes.RATE_LIMIT_EXCEEDED);
  }
}

/**
 * Global error handling middleware
 * Should be placed after all routes
 */
export const errorHandler = (err, req, res, next) => {
  // Default to 500 server error
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || ErrorCodes.INTERNAL_ERROR;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  // Log error with request context
  const logContext = {
    requestId: req.id,
    method: req.method,
    url: req.url,
    statusCode,
    errorCode,
    userId: req.user?.id,
  };

  if (statusCode >= 500) {
    logger.error({ ...logContext, err }, 'Server error occurred');
  } else if (statusCode >= 400) {
    logger.warn({ ...logContext, message }, 'Client error occurred');
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details && { details }),
      ...(isDevelopment && err.stack && { stack: err.stack }),
    },
    requestId: req.id,
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * Catch-all for 404 errors
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError('Endpoint');
  next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
