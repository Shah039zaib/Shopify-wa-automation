/**
 * Conversation Controller
 * Chat conversation management
 */

const Conversation = require('../models/Conversation');
const { NotFoundError } = require('../utils/error-handler');

/**
 * Get all conversations
 * GET /api/conversations
 */
exports.getConversations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const result = await Conversation.getAll({
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single conversation with messages
 * GET /api/conversations/:id
 */
exports.getConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.getWithMessages(id, 50);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Close conversation
 * POST /api/conversations/:id/close
 */
exports.closeConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const updated = await Conversation.close(id);

    res.json({
      success: true,
      message: 'Conversation closed successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reopen conversation
 * POST /api/conversations/:id/reopen
 */
exports.reopenConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const updated = await Conversation.reopen(id);

    res.json({
      success: true,
      message: 'Conversation reopened successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get conversation context
 * GET /api/conversations/:id/context
 */
exports.getContext = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    res.json({
      success: true,
      data: {
        context_summary: conversation.context_summary,
        messages_count: conversation.messages_count,
        last_message_at: conversation.last_message_at
      }
    });
  } catch (error) {
    next(error);
  }
};
