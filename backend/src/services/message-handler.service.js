/**
 * Message Handler Service
 * Processes incoming WhatsApp messages
 */

const Customer = require('../models/Customer');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { logger } = require('../utils/logger');
const { fromChatId } = require('../utils/phone-formatter');

/**
 * Process incoming WhatsApp message
 */
async function processMessage(message, accountId, client) {
  try {
    // Ignore group messages
    if (message.from.includes('@g.us')) {
      return;
    }

    // Get phone number
    const phoneNumber = fromChatId(message.from);

    logger.whatsapp(`Processing message from ${phoneNumber}`);

    // Get or create customer
    let customer = await Customer.findByPhone(phoneNumber);
    if (!customer) {
      customer = await Customer.create({
        phone_number: phoneNumber,
        name: message._data.notifyName || null,
        language_preference: 'urdu'
      });
      logger.whatsapp(`New customer created: ${phoneNumber}`);
    } else {
      // Update last interaction
      await Customer.updateLastInteraction(customer.id);
    }

    // Get or create conversation
    let conversation = await Conversation.findActiveByCustomer(customer.id);
    if (!conversation) {
      conversation = await Conversation.create({
        customer_id: customer.id,
        whatsapp_account_id: accountId,
        status: 'active'
      });
      logger.whatsapp(`New conversation created for customer: ${customer.id}`);
    }

    // Save incoming message
    await Message.create({
      conversation_id: conversation.id,
      sender: 'customer',
      message_text: message.body,
      message_type: message.type || 'text',
      media_url: null
    });

    // Update conversation
    await Conversation.updateLastMessage(conversation.id);
    await Conversation.incrementMessageCount(conversation.id);

    // Detect language
    const languageDetector = require('./language-detector.service');
    const detectedLanguage = languageDetector.detect(message.body);

    if (detectedLanguage !== customer.language_preference) {
      await Customer.update(customer.id, {
        language_preference: detectedLanguage
      });
    }

    // Check rate limits
    const rateLimiter = require('./rate-limiter.service');
    const canReply = await rateLimiter.checkLimit(accountId);

    if (!canReply) {
      logger.whatsapp(`Rate limit exceeded for account ${accountId}, skipping reply`);
      return;
    }

    // Generate AI response
    const aiRouter = require('./ai-router.service');
    const contextManager = require('./context-manager.service');

    // Build context
    const context = await contextManager.buildContext(conversation.id, customer);

    // Get AI response
    const aiResponse = await aiRouter.getResponse(message.body, context, detectedLanguage);

    // Apply rate limiting delay
    await rateLimiter.addDelay();

    // Send response
    await client.sendMessage(message.from, aiResponse.text);

    // Save bot message
    await Message.create({
      conversation_id: conversation.id,
      sender: 'bot',
      message_text: aiResponse.text,
      message_type: 'text',
      ai_used: aiResponse.provider
    });

    await Conversation.updateLastMessage(conversation.id);
    await Conversation.incrementMessageCount(conversation.id);

    // Emit to frontend
    if (global.io) {
      global.io.emit('new_message', {
        conversation_id: conversation.id,
        message: message.body,
        sender: 'customer'
      });

      global.io.emit('new_message', {
        conversation_id: conversation.id,
        message: aiResponse.text,
        sender: 'bot'
      });
    }

    logger.whatsapp(`Message processed successfully for ${phoneNumber}`);

  } catch (error) {
    logger.error('Error processing message:', error);
  }
}

module.exports = {
  processMessage
};
