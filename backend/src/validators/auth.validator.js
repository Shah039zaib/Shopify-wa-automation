/**
 * Auth Validators
 * Authentication request validation schemas
 */

const { 
  isValidEmail, 
  isStrongPassword,
  isEmpty 
} = require('../utils/validators');

/**
 * Validate registration data
 */
function validateRegister(data) {
  const errors = [];

  // Email validation
  if (isEmpty(data.email)) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  // Password validation
  if (isEmpty(data.password)) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (data.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  } else if (!isStrongPassword(data.password)) {
    errors.push({ 
      field: 'password', 
      message: 'Password must contain at least one uppercase, one lowercase, and one number' 
    });
  }

  // Name validation
  if (isEmpty(data.name)) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (data.name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate login data
 */
function validateLogin(data) {
  const errors = [];

  if (isEmpty(data.email)) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (isEmpty(data.password)) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate password change
 */
function validatePasswordChange(data) {
  const errors = [];

  if (isEmpty(data.currentPassword)) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }

  if (isEmpty(data.newPassword)) {
    errors.push({ field: 'newPassword', message: 'New password is required' });
  } else if (data.newPassword.length < 8) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 8 characters' });
  } else if (!isStrongPassword(data.newPassword)) {
    errors.push({ 
      field: 'newPassword', 
      message: 'New password must contain at least one uppercase, one lowercase, and one number' 
    });
  }

  if (data.currentPassword === data.newPassword) {
    errors.push({ 
      field: 'newPassword', 
      message: 'New password must be different from current password' 
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordChange
};
