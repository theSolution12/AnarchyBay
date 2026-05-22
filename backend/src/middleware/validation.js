import { z } from 'zod';
import { ValidationError } from './errorHandler.js';

/**
 * Middleware factory to validate request data using Zod schemas
 * @param {Object} schemas - Object containing schemas for body, query, params
 * @param {z.ZodSchema} schemas.body - Schema for request body
 * @param {z.ZodSchema} schemas.query - Schema for query parameters
 * @param {z.ZodSchema} schemas.params - Schema for route parameters
 * @returns {Function} Express middleware function
 */
export const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      const validationPromises = [];

      // Validate request body
      if (schemas.body) {
        validationPromises.push(
          schemas.body.parseAsync(req.body).then((data) => {
            req.body = data;
          })
        );
      }

      // Validate query parameters
      if (schemas.query) {
        validationPromises.push(
          schemas.query.parseAsync(req.query).then((data) => {
            req.query = data;
          })
        );
      }

      // Validate route parameters
      if (schemas.params) {
        validationPromises.push(
          schemas.params.parseAsync(req.params).then((data) => {
            req.params = data;
          })
        );
      }

      await Promise.all(validationPromises);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors into a more readable structure
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        next(new ValidationError('Validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Common validation schemas for reuse
 */
export const commonSchemas = {
  // UUID validation
  uuid: z.string().uuid({ message: 'Invalid UUID format' }),

  // Email validation
  email: z.string().email({ message: 'Invalid email format' }),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),

  // Date range
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),

  // Price validation
  price: z.number().positive().multipleOf(0.01),

  // Currency code
  currency: z.string().length(3).toUpperCase(),
};

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .trim();
};

/**
 * Middleware to sanitize all string inputs in request
 */
export const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }

    return obj;
  };

  if (req.body) {
    sanitizeObject(req.body);
  }

  if (req.query) {
    sanitizeObject(req.query);
  }

  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
};