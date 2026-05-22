import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret-change-in-production';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate an access token (JWT)
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generate a refresh token
 * @returns {string} Random refresh token
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Verify an access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED');
    }
    throw new Error('TOKEN_INVALID');
  }
};

/**
 * Calculate refresh token expiration date
 * @returns {Date} Expiration date
 */
export const getRefreshTokenExpiration = () => {
  const expiresIn = REFRESH_TOKEN_EXPIRES_IN;
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  
  if (!match) {
    // Default to 7 days if format is invalid
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers = {
    's': 1000,
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000
  };
  
  return new Date(Date.now() + value * multipliers[unit]);
};

/**
 * Generate password reset token
 * @returns {string} Random reset token
 */
export const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Calculate password reset token expiration (1 hour)
 * @returns {Date} Expiration date
 */
export const getPasswordResetExpiration = () => {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
};
