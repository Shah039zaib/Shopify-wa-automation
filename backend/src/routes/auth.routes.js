/**
 * Authentication Routes
 * User authentication endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const { strictRateLimit } = require('../middleware/rate-limit.middleware');

/**
 * POST /api/auth/register
 * Register new user
 */
router.post(
  '/register',
  strictRateLimit,
  validateBody({
    email: { required: true, email: true },
    password: { required: true, minLength: 8 },
    name: { required: true, minLength: 2 }
  }),
  authController.register
);

/**
 * POST /api/auth/login
 * User login
 */
router.post(
  '/login',
  strictRateLimit,
  validateBody({
    email: { required: true, email: true },
    password: { required: true }
  }),
  authController.login
);

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout', requireAuth, authController.logout);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', authController.refreshToken);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', requireAuth, authController.getProfile);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  requireAuth,
  validateBody({
    name: { required: false, minLength: 2 },
    email: { required: false, email: true }
  }),
  authController.updateProfile
);

/**
 * PUT /api/auth/password
 * Change password
 */
router.put(
  '/password',
  requireAuth,
  validateBody({
    currentPassword: { required: true },
    newPassword: { required: true, minLength: 8 }
  }),
  authController.changePassword
);

module.exports = router;
