/**
 * Package Routes
 * Service package management
 */

const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody, validateParams } = require('../middleware/validate.middleware');

/**
 * GET /api/packages
 * Get all packages
 */
router.get('/', packageController.getPackages);

/**
 * GET /api/packages/active
 * Get active packages only
 */
router.get('/active', packageController.getActivePackages);

/**
 * GET /api/packages/:id
 * Get single package
 */
router.get(
  '/:id',
  validateParams({ id: { required: true, uuid: true } }),
  packageController.getPackage
);

/**
 * POST /api/packages
 * Create new package
 */
router.post(
  '/',
  requireAuth,
  validateBody({
    name: { required: true },
    description: { required: true },
    price: { required: true, type: 'number', min: 0 },
    features: { required: true, type: 'array' }
  }),
  packageController.createPackage
);

/**
 * PUT /api/packages/:id
 * Update package
 */
router.put(
  '/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  packageController.updatePackage
);

/**
 * DELETE /api/packages/:id
 * Delete package
 */
router.delete(
  '/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  packageController.deletePackage
);

/**
 * POST /api/packages/:id/toggle
 * Toggle package active status
 */
router.post(
  '/:id/toggle',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  packageController.togglePackage
);

/**
 * POST /api/packages/reorder
 * Reorder packages
 */
router.post(
  '/reorder',
  requireAuth,
  validateBody({
    order: { required: true, type: 'array' }
  }),
  packageController.reorderPackages
);

/**
 * GET /api/packages/:id/stats
 * Get package statistics
 */
router.get(
  '/:id/stats',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  packageController.getPackageStats
);

module.exports = router;
