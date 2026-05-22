import { supabase } from '../lib/supabase.js';
import { findUserById } from '../repositories/user.repository.js';

/**
 * Middleware to require authentication using Supabase Auth
 * Verifies JWT token and attaches user to request
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        error: {
          code: 'TOKEN_MISSING',
          message: 'Missing or invalid Authorization header'
        }
      });
    }

    // Verify token with Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      if (error.message.includes('expired')) {
        return res.status(401).json({
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Access token has expired'
          }
        });
      }
      return res.status(401).json({
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid access token'
        }
      });
    }

    if (!data.user) {
      return res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Get user profile to include role
    const profile = await findUserById(data.user.id);

    // Attach user to request
    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: profile?.role || 'customer'
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      req.user = null;
      return next();
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      req.user = null;
      return next();
    }

    const profile = await findUserById(data.user.id);

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: profile?.role || 'customer'
    };

    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

/**
 * Middleware to require specific role(s)
 * Must be used after requireAuth
 * @param {string|string[]} roles - Required role(s)
 */
export const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      });
    }

    next();
  };
};

/**
 * Middleware to require creator role
 * Allow customer, creator, seller, and admin to create products
 */
export const requireCreator = requireRole(['customer', 'creator', 'seller', 'admin']);

/**
 * Middleware to require customer role
 */
export const requireCustomer = requireRole('customer');

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole('admin');