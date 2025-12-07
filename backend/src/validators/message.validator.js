/**
 * Message Validators
 * Message data validation
 */

const { isValidUUID, isEmpty } = require('../utils/validators');

/**
 * Validate send message
 */
function validateSendMessage(data) {
  const errors = [];

  // Conversation ID validation
  if (isEmpty(data.conversation_id)) {
    errors.push({ field: 'conversation_id', message: 'Conversation ID is required' });
  } else if (!isValidUUID(data.conversation_id)) {
    errors.push({ field: 'conversation_id', message: 'Invalid conversation ID format' });
  }

  // Message text validation
  if (isEmpty(data.message_text)) {
    errors.push({ field: 'message_text', message: 'Message text is required' });
  } else if (data.message_text.length > 5000) {
    errors.push({ field: 'message_text', message: 'Message text must not exceed 5000 characters' });
  }

  // Message type validation
  if (data.message_type) {
    const validTypes = ['text', 'image', 'video', 'audio', 'document'];
    if (!validTypes.includes(data.message_type)) {
      errors.push({ 
        field: 'message_type', 
        message: 'Invalid message type. Must be: text, image, video, audio, or document' 
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateSendMessage
};
