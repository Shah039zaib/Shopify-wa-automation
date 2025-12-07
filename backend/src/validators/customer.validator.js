/**
 * Customer Validators
 * Customer data validation
 */

const { 
  isValidEmail, 
  isValidPakistaniPhone,
  isEmpty 
} = require('../utils/validators');

/**
 * Validate customer creation
 */
function validateCreateCustomer(data) {
  const errors = [];

  // Phone number validation
  if (isEmpty(data.phone_number)) {
    errors.push({ field: 'phone_number', message: 'Phone number is required' });
  } else if (!isValidPakistaniPhone(data.phone_number)) {
    errors.push({ field: 'phone_number', message: 'Invalid Pakistani phone number format' });
  }

  // Name validation (optional but if provided, must be valid)
  if (data.name && data.name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  // Email validation (optional but if provided, must be valid)
  if (data.email && !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  // Language validation
  if (data.language_preference) {
    const validLanguages = ['urdu', 'english', 'roman_urdu', 'punjabi', 'sindhi'];
    if (!validLanguages.includes(data.language_preference)) {
      errors.push({ 
        field: 'language_preference', 
        message: 'Invalid language preference' 
      });
    }
  }

  // Tags validation
  if (data.tags && !Array.isArray(data.tags)) {
    errors.push({ field: 'tags', message: 'Tags must be an array' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate customer update
 */
function validateUpdateCustomer(data) {
  const errors = [];

  // Phone number validation (if being updated)
  if (data.phone_number && !isValidPakistaniPhone(data.phone_number)) {
    errors.push({ field: 'phone_number', message: 'Invalid Pakistani phone number format' });
  }

  // Name validation
  if (data.name !== undefined && data.name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  // Email validation
  if (data.email && !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  // Tags validation
  if (data.tags && !Array.isArray(data.tags)) {
    errors.push({ field: 'tags', message: 'Tags must be an array' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateCreateCustomer,
  validateUpdateCustomer
};
