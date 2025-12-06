/**
 * Conversation Routes
 * Chat conversation management
 */

const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateParams, validateQuery } = require('../middleware/validate.middleware');

/**
 * GET /api/conversations
 * Get all conversations
 */
router.get(
  '/',
  requireAuth,
  validateQuery({
    page: { type: 'number' },
    limit: { type: 'number' },
    status: { type: 'string', enum: ['active', 'closed', 'pending'] }
  }),
  conversationController.getConversations
);

/**
 * GET /api/conversations/:id
 * Get single conversation with messages
 */
router.get(
  '/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  conversationController.getConversation
);

/**
 * POST /api/conversations/:id/close
 * Close conversation
 */
router.post(
  '/:id/close',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  conversationController.closeConversation
);

/**
 * POST /api/conversations/:id/reopen
 * Reopen conversation
 */
router.post(
  '/:id/reopen',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  conversationController.reopenConversation
);

/**
 * GET /api/conversations/:id/context
 * Get conversation context
 */
router.get(
  '/:id/context',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  conversationController.getContext
);

module.exports = router;
