/**
 * Payment Routes
 * Payment method configuration
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody, validateParams } = require('../middleware/validate.middleware');
const multer = require('multer');

// Configure multer for QR code upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * GET /api/payments/methods
 * Get all payment methods
 */
router.get('/methods', requireAuth, paymentController.getMethods);

/**
 * GET /api/payments/methods/active
 * Get active payment methods
 */
router.get('/methods/active', paymentController.getActiveMethods);

/**
 * GET /api/payments/methods/:id
 * Get single payment method
 */
router.get(
  '/methods/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  paymentController.getMethod
);

/**
 * POST /api/payments/methods
 * Create payment method
 */
router.post(
  '/methods',
  requireAuth,
  validateBody({
    type: { required: true, enum: ['easypaisa', 'jazzcash', 'bank_transfer'] },
    account_title: { required: true },
    account_number: { required: true },
    iban: { required: false },
    bank_name: { required: false }
  }),
  paymentController.createMethod
);

/**
 * PUT /api/payments/methods/:id
 * Update payment method
 */
router.put(
  '/methods/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  paymentController.updateMethod
);

/**
 * DELETE /api/payments/methods/:id
 * Delete payment method
 */
router.delete(
  '/methods/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  paymentController.deleteMethod
);

/**
 * POST /api/payments/methods/:id/toggle
 * Toggle payment method active status
 */
router.post(
  '/methods/:id/toggle',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  paymentController.toggleMethod
);

/**
 * POST /api/payments/methods/:id/qr-code
 * Upload QR code for payment method
 */
router.post(
  '/methods/:id/qr-code',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  upload.single('qr_code'),
  paymentController.uploadQRCode
);

/**
 * POST /api/payments/methods/reorder
 * Reorder payment methods
 */
router.post(
  '/methods/reorder',
  requireAuth,
  validateBody({
    order: { required: true, type: 'array' }
  }),
  paymentController.reorderMethods
);

module.exports = router;
