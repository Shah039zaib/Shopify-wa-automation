/**
 * WhatsApp Routes
 * WhatsApp account and connection management
 */

const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody, validateParams } = require('../middleware/validate.middleware');

/**
 * GET /api/whatsapp/accounts
 * Get all WhatsApp accounts
 */
router.get('/accounts', requireAuth, whatsappController.getAccounts);

/**
 * POST /api/whatsapp/accounts
 * Add new WhatsApp account
 */
router.post(
  '/accounts',
  requireAuth,
  validateBody({
    phone_number: { required: true, phone: true },
    name: { required: true }
  }),
  whatsappController.addAccount
);

/**
 * GET /api/whatsapp/accounts/:id
 * Get single WhatsApp account
 */
router.get(
  '/accounts/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  whatsappController.getAccount
);

/**
 * PUT /api/whatsapp/accounts/:id
 * Update WhatsApp account
 */
router.put(
  '/accounts/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  whatsappController.updateAccount
);

/**
 * DELETE /api/whatsapp/accounts/:id
 * Delete WhatsApp account
 */
router.delete(
  '/accounts/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  whatsappController.deleteAccount
);

/**
 * GET /api/whatsapp/qr/:accountId
 * Get QR code for account
 */
router.get(
  '/qr/:accountId',
  requireAuth,
  validateParams({ accountId: { required: true, uuid: true } }),
  whatsappController.getQRCode
);

/**
 * GET /api/whatsapp/status/:accountId
 * Get connection status
 */
router.get(
  '/status/:accountId',
  requireAuth,
  validateParams({ accountId: { required: true, uuid: true } }),
  whatsappController.getStatus
);

/**
 * POST /api/whatsapp/disconnect/:accountId
 * Disconnect account
 */
router.post(
  '/disconnect/:accountId',
  requireAuth,
  validateParams({ accountId: { required: true, uuid: true } }),
  whatsappController.disconnect
);

/**
 * POST /api/whatsapp/reconnect/:accountId
 * Reconnect account
 */
router.post(
  '/reconnect/:accountId',
  requireAuth,
  validateParams({ accountId: { required: true, uuid: true } }),
  whatsappController.reconnect
);

/**
 * GET /api/whatsapp/safety-stats/:accountId
 * Get safety statistics
 */
router.get(
  '/safety-stats/:accountId',
  requireAuth,
  validateParams({ accountId: { required: true, uuid: true } }),
  whatsappController.getSafetyStats
);

/**
 * PUT /api/whatsapp/settings
 * Update WhatsApp settings
 */
router.put('/settings', requireAuth, whatsappController.updateSettings);

module.exports = router;
