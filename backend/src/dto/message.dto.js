/**
 * Message DTOs
 * Data Transfer Objects for messages
 */

const { formatRelativeTime } = require('../utils/formatters');

/**
 * Format message response
 */
function formatMessageResponse(message) {
  return {
    id: message.id,
    conversation_id: message.conversation_id,
    sender: message.sender,
    message_text: message.message_text,
    message_type: message.message_type,
    media_url: message.media_url,
    ai_used: message.ai_used,
    timestamp: message.timestamp,
    timestamp_relative: formatRelativeTime(message.timestamp),
    read_at: message.read_at,
    is_read: !!message.read_at
  };
}

/**
 * Format message list response
 */
function formatMessageList(messages) {
  return messages.map(formatMessageResponse);
}

/**
 * Format conversation with messages
 */
function formatConversationWithMessages(conversation) {
  return {
    id: conversation.id,
    customer_id: conversation.customer_id,
    customer_name: conversation.customer_name,
    customer_phone: conversation.phone_number,
    whatsapp_account_id: conversation.whatsapp_account_id,
    status: conversation.status,
    messages_count: conversation.messages_count,
    last_message_at: conversation.last_message_at,
    created_at: conversation.created_at,
    messages: conversation.messages ? formatMessageList(conversation.messages) : []
  };
}

module.exports = {
  formatMessageResponse,
  formatMessageList,
  formatConversationWithMessages
};
