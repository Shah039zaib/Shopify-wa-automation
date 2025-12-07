/**
 * Message Controller
 * Message management logic
 */

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { NotFoundError } = require('../utils/error-handler');

/**
 * Get messages for a conversation
 * GET /api/messages/conversation/:conversationId
 */
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const messages = await Message.findByConversation(conversationId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send manual message
 * POST /api/messages/send
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversation_id, message_text, message_type = 'text' } = req.body;

    const conversation = await Conversation.findById(conversation_id);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    // Create message
    const message = await Message.create({
      conversation_id,
      sender: 'admin',
      message_text,
      message_type
    });

    // Update conversation
    await Conversation.updateLastMessage(conversation_id);
    await Conversation.incrementMessageCount(conversation_id);

    // Emit socket event for real-time update
    if (global.io) {
      global.io.emit('new_message', message);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark message as read
 * PUT /api/messages/:id/read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    const updated = await Message.markAsRead(id);

    res.json({
      success: true,
      message: 'Message marked as read',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all conversation messages as read
 * POST /api/messages/conversation/:conversationId/read-all
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    await Message.markConversationAsRead(conversationId);

    res.json({
      success: true,
      message: 'All messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete message
 * DELETE /api/messages/:id
 */
exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    await Message.delete(id);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
