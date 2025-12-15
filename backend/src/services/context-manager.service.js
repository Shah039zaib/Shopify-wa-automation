/**
 * Context Manager Service
 * Builds and manages conversation context for AI responses
 */

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Package = require('../models/Package');
const { logger } = require('../utils/logger');
const { defaultPrompts, responseGuidelines } = require('../config/ai-providers');

// Maximum messages to include in context
const MAX_CONTEXT_MESSAGES = 10;

/**
 * Build context for AI response
 */
async function buildContext(conversationId, customer) {
  try {
    // Get conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get recent messages
    const messages = await Message.findByConversation(conversationId, { limit: MAX_CONTEXT_MESSAGES });

    // Get customer orders
    const orders = await Order.getByCustomer(customer.id);

    // Get available packages
    const packages = await Package.getAll();

    // Determine conversation stage
    const stage = determineConversationStage(conversation, messages, orders);

    // Build the context object
    const context = {
      customer: {
        id: customer.id,
        name: customer.name || 'Customer',
        phone: customer.phone_number,
        language: customer.language_preference || 'urdu',
        totalOrders: customer.total_orders || 0,
        status: customer.status || 'active'
      },
      conversation: {
        id: conversationId,
        stage,
        messageCount: conversation.message_count || 0,
        createdAt: conversation.created_at,
        lastMessage: conversation.last_message_at
      },
      history: formatMessageHistory(messages),
      orders: formatOrders(orders),
      packages: formatPackages(packages),
      systemPrompt: getSystemPrompt(stage, customer.language_preference),
      guidelines: responseGuidelines
    };

    return context;
  } catch (error) {
    logger.error('Error building context:', error);
    throw error;
  }
}

/**
 * Determine conversation stage
 */
function determineConversationStage(conversation, messages, orders) {
  // If customer has active orders, they're in post-sale stage
  const activeOrders = orders.filter(o => ['pending', 'in_progress'].includes(o.status));
  if (activeOrders.length > 0) {
    return 'post_sale';
  }

  // If customer has completed orders, they're returning
  const completedOrders = orders.filter(o => o.status === 'completed');
  if (completedOrders.length > 0) {
    return 'returning_customer';
  }

  // Analyze message content
  const messageCount = messages.length;
  const lastMessages = messages.slice(0, 3).map(m => m.message_text?.toLowerCase() || '');
  const allText = lastMessages.join(' ');

  // Check for payment-related keywords
  const paymentKeywords = ['payment', 'pay', 'paise', 'paisay', 'bank', 'easypaisa', 'jazzcash', 'transfer'];
  if (paymentKeywords.some(kw => allText.includes(kw))) {
    return 'payment';
  }

  // Check for price/package inquiries
  const priceKeywords = ['price', 'cost', 'kitna', 'kitne', 'package', 'rate', 'charges'];
  if (priceKeywords.some(kw => allText.includes(kw))) {
    return 'pricing';
  }

  // Check for feature inquiries
  const featureKeywords = ['feature', 'kya milega', 'include', 'provide', 'service'];
  if (featureKeywords.some(kw => allText.includes(kw))) {
    return 'features';
  }

  // Initial greeting stage
  if (messageCount <= 2) {
    return 'greeting';
  }

  // General sales conversation
  return 'sales';
}

/**
 * Get appropriate system prompt based on stage
 */
function getSystemPrompt(stage, language) {
  const lang = language === 'english' ? 'english' : 'urdu';

  const prompts = {
    greeting: defaultPrompts.welcome[lang],
    sales: defaultPrompts.sales[lang],
    pricing: `${defaultPrompts.sales[lang]}\n\nCustomer is asking about pricing. Share package details clearly.`,
    features: `${defaultPrompts.sales[lang]}\n\nCustomer wants to know about features. Explain in detail.`,
    payment: defaultPrompts.payment[lang],
    post_sale: `Customer ka order process mein hai. Unhe order status updates do aur koi confusion clear karo.`,
    returning_customer: `Yeh returning customer hai. Unhe special treatment do aur new services offer karo.`
  };

  return prompts[stage] || prompts.sales;
}

/**
 * Format message history for AI context
 */
function formatMessageHistory(messages) {
  return messages.reverse().map(msg => ({
    role: msg.sender === 'customer' ? 'user' : 'assistant',
    content: msg.message_text,
    timestamp: msg.created_at
  }));
}

/**
 * Format orders for context
 */
function formatOrders(orders) {
  return orders.slice(0, 5).map(order => ({
    id: order.id,
    package: order.package_name,
    amount: order.total_amount,
    status: order.status,
    createdAt: order.created_at
  }));
}

/**
 * Format packages for context
 */
function formatPackages(packages) {
  return packages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    price: pkg.price,
    features: pkg.features,
    popular: pkg.is_popular
  }));
}

/**
 * Get summary of conversation for context window
 */
async function getConversationSummary(conversationId) {
  try {
    const messages = await Message.findByConversation(conversationId, 50);

    if (messages.length === 0) {
      return null;
    }

    // Create summary
    const customerMessages = messages.filter(m => m.sender === 'customer');
    const botMessages = messages.filter(m => m.sender === 'bot');

    // Extract key topics
    const allText = customerMessages.map(m => m.message_text).join(' ').toLowerCase();
    const topics = [];

    if (allText.includes('price') || allText.includes('kitna')) topics.push('pricing');
    if (allText.includes('feature') || allText.includes('kya')) topics.push('features');
    if (allText.includes('payment') || allText.includes('pay')) topics.push('payment');
    if (allText.includes('delivery') || allText.includes('time')) topics.push('delivery');

    return {
      totalMessages: messages.length,
      customerMessages: customerMessages.length,
      botMessages: botMessages.length,
      topics,
      firstMessage: messages[messages.length - 1]?.created_at,
      lastMessage: messages[0]?.created_at
    };
  } catch (error) {
    logger.error('Error getting conversation summary:', error);
    return null;
  }
}

/**
 * Update context with new information
 */
function updateContext(context, updates) {
  return {
    ...context,
    ...updates,
    updatedAt: new Date()
  };
}

/**
 * Extract intent from message
 */
function extractIntent(message) {
  const text = message.toLowerCase();

  const intents = {
    greeting: ['hello', 'hi', 'salam', 'assalam', 'hey'],
    pricing: ['price', 'cost', 'kitna', 'rate', 'charges', 'fee'],
    features: ['feature', 'include', 'kya milega', 'services'],
    payment: ['payment', 'pay', 'bank', 'transfer', 'easypaisa', 'jazzcash'],
    support: ['help', 'problem', 'issue', 'error', 'support'],
    order: ['order', 'buy', 'purchase', 'kharidna', 'lena'],
    status: ['status', 'update', 'progress', 'kab'],
    thanks: ['thanks', 'thank', 'shukriya', 'shukria'],
    bye: ['bye', 'goodbye', 'khuda hafiz', 'allah hafiz']
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(kw => text.includes(kw))) {
      return intent;
    }
  }

  return 'general';
}

module.exports = {
  buildContext,
  determineConversationStage,
  getSystemPrompt,
  getConversationSummary,
  updateContext,
  extractIntent,
  MAX_CONTEXT_MESSAGES
};
