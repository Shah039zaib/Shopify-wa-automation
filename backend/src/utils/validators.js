/**
 * Validation Utilities
 * Common validation functions
 */

/**
 * Validate email format
 */
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (international)
 */
function isValidPhone(phone) {
  if (!phone) return false;
  // Supports formats: +923001234567, 03001234567, 923001234567
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate Pakistani phone number
 */
function isValidPakistaniPhone(phone) {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  // Formats: 03001234567, +923001234567, 923001234567
  const pkPhoneRegex = /^(\+92|92|0)?3[0-9]{9}$/;
  return pkPhoneRegex.test(cleanPhone);
}

/**
 * Validate password strength
 */
function isStrongPassword(password) {
  if (!password || password.length < 8) return false;
  
  // Check for at least one number, one lowercase, one uppercase
  const hasNumber = /[0-9]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  
  return hasNumber && hasLower && hasUpper;
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate price (positive number)
 */
function isValidPrice(price) {
  const num = parseFloat(price);
  return !isNaN(num) && num >= 0;
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid) {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize string (remove HTML tags, special chars)
 */
function sanitizeString(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\s@.-]/g, '') // Keep only alphanumeric, spaces, @, ., -
    .trim();
}

/**
 * Validate JSON string
 */
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateString) {
  if (!dateString) return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate time format (HH:mm)
 */
function isValidTime(timeString) {
  if (!timeString) return false;
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

/**
 * Check if string is empty or whitespace
 */
function isEmpty(str) {
  return !str || str.trim().length === 0;
}

/**
 * Validate Pakistan IBAN
 */
function isValidIBAN(iban) {
  if (!iban) return false;
  const cleanIBAN = iban.replace(/\s/g, '');
  // Pakistan IBAN: PK followed by 22 digits
  const ibanRegex = /^PK[0-9]{2}[A-Z]{4}[0-9]{16}$/;
  return ibanRegex.test(cleanIBAN);
}

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidPakistaniPhone,
  isStrongPassword,
  isValidUrl,
  isValidPrice,
  isValidUUID,
  sanitizeString,
  isValidJSON,
  isValidDate,
  isValidTime,
  isEmpty,
  isValidIBAN
};
