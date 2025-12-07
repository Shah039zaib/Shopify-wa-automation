/**
 * Payment Validators
 * Payment method data validation
 */

const { isEmpty, isValidIBAN } = require('../utils/validators');

/**
 * Validate create payment method
 */
function validateCreatePaymentMethod(data) {
  const errors = [];

  // Type validation
  const validTypes = ['easypaisa', 'jazzcash', 'bank_transfer'];
  if (isEmpty(data.type)) {
    errors.push({ field: 'type', message: 'Payment method type is required' });
  } else if (!validTypes.includes(data.type)) {
    errors.push({ 
      field: 'type', 
      message: `Type must be one of: ${validTypes.join(', ')}` 
    });
  }

  // Account title validation
  if (isEmpty(data.account_title)) {
    errors.push({ field: 'account_title', message: 'Account title is required' });
  } else if (data.account_title.length < 3) {
    errors.push({ field: 'account_title', message: 'Account title must be at least 3 characters' });
  }

  // Account number validation
  if (isEmpty(data.account_number)) {
    errors.push({ field: 'account_number', message: 'Account number is required' });
  } else if (data.account_number.length < 10) {
    errors.push({ field: 'account_number', message: 'Account number must be at least 10 characters' });
  }

  // Bank-specific validations
  if (data.type === 'bank_transfer') {
    // IBAN validation for bank transfers
    if (data.iban && !isValidIBAN(data.iban)) {
      errors.push({ field: 'iban', message: 'Invalid IBAN format' });
    }

    // Bank name validation for bank transfers
    if (isEmpty(data.bank_name)) {
      errors.push({ field: 'bank_name', message: 'Bank name is required for bank transfers' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate update payment method
 */
function validateUpdatePaymentMethod(data) {
  const errors = [];

  // Type validation (if provided)
  if (data.type) {
    const validTypes = ['easypaisa', 'jazzcash', 'bank_transfer'];
    if (!validTypes.includes(data.type)) {
      errors.push({ 
        field: 'type', 
        message: `Type must be one of: ${validTypes.join(', ')}` 
      });
    }
  }

  // Account title validation (if provided)
  if (data.account_title !== undefined && data.account_title.length < 3) {
    errors.push({ field: 'account_title', message: 'Account title must be at least 3 characters' });
  }

  // Account number validation (if provided)
  if (data.account_number !== undefined && data.account_number.length < 10) {
    errors.push({ field: 'account_number', message: 'Account number must be at least 10 characters' });
  }

  // IBAN validation (if provided)
  if (data.iban && !isValidIBAN(data.iban)) {
    errors.push({ field: 'iban', message: 'Invalid IBAN format' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateCreatePaymentMethod,
  validateUpdatePaymentMethod
};
