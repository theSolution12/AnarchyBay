import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to add unique request ID to each request
 * The request ID can be used for tracing and debugging
 */
export const requestIdMiddleware = (req, res, next) => {
  // Check if request ID is provided in header, otherwise generate new one
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  // Attach to request object
  req.id = requestId;
  
  // Add to response headers for client tracking
  res.setHeader('X-Request-ID', requestId);
  
  next();
};
