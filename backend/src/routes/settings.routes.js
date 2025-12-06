/**
 * Settings Routes
 * System settings management
 */

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const { validateBody, validateParams } = require('../middleware/validate.middleware');

/**
 * GET /api/settings
 * Get all settings
 */
router.get('/', requireAuth, settingsController.getSettings);

/**
 * GET /api/settings/category/:category
 * Get settings by category
 */
router.get(
  '/category/:category',
  requireAuth,
  validateParams({ 
    category: { 
      required: true, 
      enum: ['general', 'whatsapp', 'ai', 'payment', 'security', 'notification'] 
    } 
  }),
  settingsController.getSettingsByCategory
);

/**
 * GET /api/settings/:key
 * Get single setting
 */
router.get(
  '/:key',
  requireAuth,
  validateParams({ key: { required: true } }),
  settingsController.getSetting
);

/**
 * PUT /api/settings/:key
 * Update single setting
 */
router.put(
  '/:key',
  requireAuth,
  requireAdmin,
  validateParams({ key: { required: true } }),
  validateBody({
    value: { required: true }
  }),
  settingsController.updateSetting
);

/**
 * POST /api/settings/bulk-update
 * Bulk update settings
 */
router.post(
  '/bulk-update',
  requireAuth,
  requireAdmin,
  validateBody({
    settings: { required: true, type: 'array' }
  }),
  settingsController.bulkUpdateSettings
);

/**
 * POST /api/settings/reset
 * Reset settings to defaults
 */
router.post(
  '/reset',
  requireAuth,
  requireAdmin,
  settingsController.resetSettings
);

/**
 * GET /api/settings/categories
 * Get all setting categories
 */
router.get('/meta/categories', requireAuth, settingsController.getCategories);

module.exports = router;
