import { v4 as uuidv4 } from 'uuid';
import { hashPassword, verifyPassword } from '../lib/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  getRefreshTokenExpiration,
  generatePasswordResetToken,
  getPasswordResetExpiration
} from '../lib/jwt.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  findUserByResetToken
} from '../repositories/user.repository.js';
import {
  storeRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteUserRefreshTokens
} from '../repositories/refreshToken.repository.js';
import { supabase, supabaseAdmin } from '../lib/supabase.js';

// Frontend URL for redirects
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Create user profile for OAuth users
 * @param {Object} userData - User data from OAuth
 * @returns {Promise<Object>} Created user profile
 */
const createUserWithProfile = async (userData) => {
  const profile = {
    id: userData.id,
    email: userData.email,
    name: userData.name || 'User',
    role: userData.role || 'customer',
    created_at: new Date().toISOString()
  };
  
  return await createUser(profile);
};

/**
 * Register a new user with email verification
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User data (requires email verification)
 */
export const signUp = async ({ email, password, name, role = 'customer' }) => {
  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  // Validate role
  const validRoles = ['customer', 'seller', 'creator', 'admin'];
  if (!validRoles.includes(role)) {
    throw new Error('INVALID_ROLE');
  }

  // Create user in Supabase Auth with email verification enabled
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
      emailRedirectTo: `${FRONTEND_URL}/auth/callback?type=email_verified`,
    }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
    throw authError;
  }

  // If user already exists in Supabase but unconfirmed, authData.user exists but session is null
  if (!authData.user) {
    throw new Error('SIGNUP_FAILED');
  }

  // Hash password for our profile table
  const passwordHash = await hashPassword(password);

  // Create user profile with the auth user's ID
  // Note: User won't be able to login until email is verified
  const user = await createUser({
    id: authData.user.id,
    email,
    password_hash: passwordHash,
    name: name || 'Anonymous',
    role,
    email_verified: false
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at
    },
    message: 'Please check your email to verify your account',
    requiresEmailVerification: true
  };
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} User data with tokens
 */
export const login = async ({ email, password }) => {
  // Try Supabase auth first for proper email verification check
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    // Check if it's an email not confirmed error
    if (authError.message.includes('Email not confirmed')) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }
    if (authError.message.includes('Invalid login credentials')) {
      throw new Error('INVALID_CREDENTIALS');
    }
    throw authError;
  }

  if (!authData.session) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  // Find user in our database
  const user = await findUserByEmail(email);
  if (!user) {
    // Create profile if it doesn't exist (rare case)
    const newUser = await createUser({
      id: authData.user.id,
      email,
      name: authData.user.user_metadata?.name || 'User',
      role: authData.user.user_metadata?.role || 'customer',
      email_verified: true
    });
    
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        created_at: newUser.created_at
      },
      session: {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresAt: authData.session.expires_at
      }
    };
  }

  // Update email_verified status if needed
  if (!user.email_verified) {
    await updateUser(user.id, { email_verified: true });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at
    },
    session: {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresAt: authData.session.expires_at
    }
  };
};

/**
 * Resend verification email
 * @param {string} email - User email
 * @returns {Promise<Object>} Result message
 */
export const resendVerificationEmail = async (email) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${FRONTEND_URL}/auth/callback?type=email_verified`,
    }
  });

  if (error) {
    throw error;
  }

  return { message: 'Verification email sent' };
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New tokens
 */
export const refreshAccessToken = async (refreshToken) => {
  // Find refresh token in database
  const tokenRecord = await findRefreshToken(refreshToken);
  if (!tokenRecord) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // Check if token is expired
  if (new Date(tokenRecord.expires_at) < new Date()) {
    await deleteRefreshToken(refreshToken);
    throw new Error('REFRESH_TOKEN_EXPIRED');
  }

  // Get user
  const user = await findUserById(tokenRecord.user_id);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // Delete old refresh token (token rotation)
  await deleteRefreshToken(refreshToken);

  // Generate new tokens
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  const newRefreshToken = generateRefreshToken();
  const refreshTokenExpiry = getRefreshTokenExpiration();

  // Store new refresh token
  await storeRefreshToken(user.id, newRefreshToken, refreshTokenExpiry);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

/**
 * Get current user from access token
 * @param {string} token - Access token
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async (token) => {
  // Try Supabase token verification first (for OAuth)
  const { data: supabaseData, error: supabaseError } = await supabase.auth.getUser(token);
  
  if (!supabaseError && supabaseData.user) {
    // Token is a valid Supabase token (OAuth login)
    const user = await findUserById(supabaseData.user.id);
    
    if (!user) {
      // User authenticated via OAuth but doesn't have a profile - create one
      const newProfile = await createUserWithProfile({
        id: supabaseData.user.id,
        email: supabaseData.user.email,
        name: supabaseData.user.user_metadata?.full_name || supabaseData.user.email?.split('@')[0] || 'User',
        role: 'customer'
      });
      
      return {
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        role: newProfile.role,
        created_at: newProfile.created_at
      };
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at
    };
  }
  
  // Fallback to custom JWT verification (for email/password login)
  try {
    const decoded = verifyAccessToken(token);
    const user = await findUserById(decoded.userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at
    };
  } catch {
    throw new Error('TOKEN_INVALID');
  }
};

/**
 * Logout user (invalidate refresh token)
 * @param {string} refreshToken - Refresh token to invalidate
 * @returns {Promise<void>}
 */
export const logout = async (refreshToken) => {
  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  }
};

/**
 * Logout user from all devices
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const logoutAllDevices = async (userId) => {
  await deleteUserRefreshTokens(userId);
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Reset token (in production, send via email)
 */
export const requestPasswordReset = async (email) => {
  // Find user
  const user = await findUserByEmail(email);
  if (!user) {
    // Don't reveal if email exists
    return { message: 'If the email exists, a reset link has been sent' };
  }

  // Generate reset token
  const resetToken = generatePasswordResetToken();
  const expiresAt = getPasswordResetExpiration();

  // Store reset token
  await updateUser(user.id, {
    password_reset_token: resetToken,
    password_reset_expires_at: expiresAt.toISOString()
  });

  // In production, send email with reset link
  // For now, return token (for testing)
  return {
    message: 'If the email exists, a reset link has been sent',
    resetToken // Remove this in production
  };
};

/**
 * Reset password using reset token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success message
 */
export const resetPassword = async (token, newPassword) => {
  // Find user by reset token
  const user = await findUserByResetToken(token);
  if (!user) {
    throw new Error('INVALID_OR_EXPIRED_RESET_TOKEN');
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password and clear reset token
  await updateUser(user.id, {
    password_hash: passwordHash,
    password_reset_token: null,
    password_reset_expires_at: null
  });

  // Invalidate all refresh tokens (logout from all devices)
  await deleteUserRefreshTokens(user.id);

  return {
    message: 'Password reset successful'
  };
};