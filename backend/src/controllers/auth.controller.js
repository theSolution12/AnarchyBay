import {
  signUp,
  login,
  refreshAccessToken,
  getCurrentUser,
  logout,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail
} from '../services/auth.service.js';

/**
 * Sign up a new user
 */
export const signUpController = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'Email and password are required'
        }
      });
    }

    const result = await signUp({ email, password, name, role });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error in signUp controller:', error);

    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(409).json({
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email already exists'
        }
      });
    }

    if (error.message === 'INVALID_ROLE') {
      return res.status(400).json({
        error: {
          code: 'INVALID_ROLE',
          message: 'Invalid role specified'
        }
      });
    }

    if (error.message === 'SIGNUP_FAILED') {
      return res.status(500).json({
        error: {
          code: 'SIGNUP_FAILED',
          message: 'Failed to create account. Please try again.'
        }
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during registration'
      }
    });
  }
};

/**
 * Login user
 */
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'Email and password are required'
        }
      });
    }

    const result = await login({ email, password });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in login controller:', error);

    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    if (error.message === 'EMAIL_NOT_VERIFIED') {
      return res.status(403).json({
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before logging in. Check your inbox for a verification link.'
        }
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during login'
      }
    });
  }
};

/**
 * Resend verification email
 */
export const resendVerificationController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'Email is required'
        }
      });
    }

    const result = await resendVerificationEmail(email);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in resendVerification controller:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while sending verification email'
      }
    });
  }
};

/**
 * Refresh access token
 */
export const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'Refresh token is required'
        }
      });
    }

    const result = await refreshAccessToken(refreshToken);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in refreshToken controller:', error);

    if (error.message === 'INVALID_REFRESH_TOKEN') {
      return res.status(401).json({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid refresh token'
        }
      });
    }

    if (error.message === 'REFRESH_TOKEN_EXPIRED') {
      return res.status(401).json({
        error: {
          code: 'REFRESH_TOKEN_EXPIRED',
          message: 'Refresh token has expired'
        }
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while refreshing token'
      }
    });
  }
};

/**
 * Get current user
 */
export const getCurrentUserController = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({
        error: {
          code: 'TOKEN_MISSING',
          message: 'Authorization token missing'
        }
      });
    }

    const user = await getCurrentUser(token);
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in getCurrentUser controller:', error);

    if (error.message === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired'
        }
      });
    }

    if (error.message === 'TOKEN_INVALID') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_INVALID',
          message: 'Invalid access token'
        }
      });
    }

    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching user'
      }
    });
  }
};

/**
 * Logout user
 */
export const logoutController = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    await logout(refreshToken);
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout controller:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during logout'
      }
    });
  }
};

/**
 * Request password reset
 */
export const requestPasswordResetController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'Email is required'
        }
      });
    }

    const result = await requestPasswordReset(email);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in requestPasswordReset controller:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while processing password reset request'
      }
    });
  }
};

/**
 * Reset password
 */
export const resetPasswordController = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'Token and new password are required'
        }
      });
    }

    const result = await resetPassword(token, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in resetPassword controller:', error);

    if (error.message === 'INVALID_OR_EXPIRED_RESET_TOKEN') {
      return res.status(400).json({
        error: {
          code: 'INVALID_OR_EXPIRED_RESET_TOKEN',
          message: 'Invalid or expired reset token'
        }
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while resetting password'
      }
    });
  }
};