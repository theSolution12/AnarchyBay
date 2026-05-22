import express from 'express';
import {
  signUpController,
  loginController,
  refreshTokenController,
  getCurrentUserController,
  logoutController,
  requestPasswordResetController,
  resetPasswordController,
  resendVerificationController
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signUpController);
router.post('/login', loginController);
router.post('/refresh', refreshTokenController);
router.post('/resend-verification', resendVerificationController);
router.post('/password-reset/request', requestPasswordResetController);
router.post('/password-reset/confirm', resetPasswordController);

// Protected routes
router.get('/me', requireAuth, getCurrentUserController);
router.post('/logout', logoutController);

export default router;