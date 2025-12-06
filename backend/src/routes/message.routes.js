/**
 * Message Routes
 * Message management endpoints
 */

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody, validateParams, validateQuery } = require('../middleware/validate.middleware');

/**
 * GET /api/messages/conversation/:conversationId
 * Get messages for a conversation
 */
router.get(
  '/conversation/:conversationId',
  requireAuth,
  validateParams({ conversationId: { required: true, uuid: true } }),
  validateQuery({
    limit: { type: 'number' },
    offset: { type: 'number' }
  }),
  messageController.getMessages
);

/**
 * POST /api/messages/send
 * Send manual message
 */
router.post(
  '/send',
  requireAuth,
  validateBody({
    conversation_id: { required: true, uuid: true },
    message_text: { required: true },
    message_type: { required: false, enum: ['text', 'image', 'video', 'audio', 'document'] }
  }),
  messageController.sendMessage
);

/**
 * PUT /api/messages/:id/read
 * Mark message as read
 */
router.put(
  '/:id/read',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  messageController.markAsRead
);

/**
 * POST /api/messages/conversation/:conversationId/read-all
 * Mark all conversation messages as read
 */
router.post(
  '/conversation/:conversationId/read-all',
  requireAuth,
  validateParams({ conversationId: { required: true, uuid: true } }),
  messageController.markAllAsRead
);

/**
 * DELETE /api/messages/:id
 * Delete message
 */
router.delete(
  '/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  messageController.deleteMessage
);

module.exports = router;
