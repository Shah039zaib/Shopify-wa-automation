/**
 * Phone Number Formatter
 * Pakistani phone number formatting utilities
 */

/**
 * Clean phone number (remove spaces, dashes, etc)
 */
function cleanPhone(phone) {
  if (!phone) return '';
  return phone.replace(/[\s\-()]/g, '');
}

/**
 * Format phone for WhatsApp (with country code, no +)
 */
function formatForWhatsApp(phone) {
  if (!phone) return '';
  
  const cleaned = cleanPhone(phone);
  
  // Remove + if present
  let formatted = cleaned.replace(/^\+/, '');
  
  // If starts with 0, replace with 92
  if (formatted.startsWith('0')) {
    formatted = '92' + formatted.slice(1);
  }
  
  // If doesn't start with 92, add it
  if (!formatted.startsWith('92')) {
    formatted = '92' + formatted;
  }
  
  return formatted;
}

/**
 * Format phone for display (+92 format)
 */
function formatForDisplay(phone) {
  if (!phone) return '';
  
  const cleaned = cleanPhone(phone);
  let formatted = cleaned;
  
  // Add + if not present
  if (!formatted.startsWith('+')) {
    // If starts with 0, replace with +92
    if (formatted.startsWith('0')) {
      formatted = '+92' + formatted.slice(1);
    }
    // If starts with 92, add +
    else if (formatted.startsWith('92')) {
      formatted = '+' + formatted;
    }
    // Otherwise add +92
    else {
      formatted = '+92' + formatted;
    }
  }
  
  return formatted;
}

/**
 * Format phone with spaces (readable format)
 */
function formatReadable(phone) {
  if (!phone) return '';
  
  const display = formatForDisplay(phone);
  
  // Format: +92 300 1234567
  if (display.length >= 13) {
    return `${display.slice(0, 3)} ${display.slice(3, 6)} ${display.slice(6)}`;
  }
  
  return display;
}

/**
 * Extract WhatsApp chat ID from phone
 */
function toChatId(phone) {
  const formatted = formatForWhatsApp(phone);
  return `${formatted}@c.us`;
}

/**
 * Extract phone from WhatsApp chat ID
 */
function fromChatId(chatId) {
  if (!chatId) return '';
  return chatId.replace('@c.us', '').replace('@g.us', '');
}

/**
 * Validate Pakistani phone number
 */
function isValidPakistaniPhone(phone) {
  if (!phone) return false;
  
  const cleaned = cleanPhone(phone);
  
  // Check various formats
  const patterns = [
    /^0?3[0-9]{9}$/,           // 03001234567 or 3001234567
    /^\+923[0-9]{9}$/,         // +923001234567
    /^923[0-9]{9}$/            // 923001234567
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Get phone operator (Jazz, Zong, Telenor, Ufone)
 */
function getOperator(phone) {
  if (!phone) return 'Unknown';
  
  const cleaned = cleanPhone(phone);
  const mobilePart = cleaned.replace(/^(\+92|92|0)/, '');
  
  if (!mobilePart || mobilePart.length < 3) return 'Unknown';
  
  const prefix = mobilePart.slice(0, 3);
  
  // Operator prefixes
  const operators = {
    '300': 'Jazz',
    '301': 'Jazz',
    '302': 'Jazz',
    '303': 'Jazz',
    '304': 'Jazz',
    '305': 'Jazz',
    '306': 'Jazz',
    '307': 'Jazz',
    '308': 'Jazz',
    '309': 'Jazz',
    '310': 'Zong',
    '311': 'Zong',
    '312': 'Zong',
    '313': 'Zong',
    '314': 'Zong',
    '315': 'Zong',
    '316': 'Zong',
    '317': 'Zong',
    '318': 'Zong',
    '320': 'Ufone',
    '321': 'Ufone',
    '322': 'Ufone',
    '323': 'Ufone',
    '324': 'Ufone',
    '325': 'Ufone',
    '330': 'Telenor',
    '331': 'Telenor',
    '332': 'Telenor',
    '333': 'Telenor',
    '334': 'Telenor',
    '335': 'Telenor',
    '336': 'Telenor',
    '337': 'Telenor',
    '340': 'Jazz',
    '341': 'Jazz',
    '342': 'Jazz',
    '343': 'Jazz',
    '344': 'Jazz',
    '345': 'Jazz',
    '346': 'Jazz',
    '347': 'Jazz',
    '348': 'Jazz',
    '349': 'Jazz'
  };
  
  return operators[prefix] || 'Unknown';
}

/**
 * Mask phone number for privacy
 */
function maskPhone(phone) {
  if (!phone) return '';
  
  const formatted = formatForDisplay(phone);
  
  if (formatted.length < 8) return formatted;
  
  // Show first 4 and last 4 digits
  const visible = 4;
  const masked = '*'.repeat(formatted.length - (visible * 2));
  
  return formatted.slice(0, visible) + masked + formatted.slice(-visible);
}

/**
 * Normalize phone (standard format for database)
 */
function normalize(phone) {
  return formatForWhatsApp(phone);
}

/**
 * Compare two phone numbers (are they the same?)
 */
function isSameNumber(phone1, phone2) {
  if (!phone1 || !phone2) return false;
  
  const normalized1 = normalize(phone1);
  const normalized2 = normalize(phone2);
  
  return normalized1 === normalized2;
}

/**
 * Format phone for EasyPaisa/JazzCash (without +)
 */
function formatForPayment(phone) {
  const formatted = formatForWhatsApp(phone);
  
  // Return with leading 0 for payment apps
  if (formatted.startsWith('92')) {
    return '0' + formatted.slice(2);
  }
  
  return formatted;
}

module.exports = {
  cleanPhone,
  formatForWhatsApp,
  formatForDisplay,
  formatReadable,
  toChatId,
  fromChatId,
  isValidPakistaniPhone,
  getOperator,
  maskPhone,
  normalize,
  isSameNumber,
  formatForPayment
};
