/**
 * Settings Validators
 * System settings validation
 */

const { isEmpty } = require('../utils/validators');

/**
 * Validate setting update
 */
function validateSettingUpdate(data) {
  const errors = [];

  if (data.value === undefined || data.value === null) {
    errors.push({ field: 'value', message: 'Setting value is required' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate bulk settings update
 */
function validateBulkSettingsUpdate(data) {
  const errors = [];

  if (!data.settings) {
    errors.push({ field: 'settings', message: 'Settings array is required' });
    return { isValid: false, errors };
  }

  if (!Array.isArray(data.settings)) {
    errors.push({ field: 'settings', message: 'Settings must be an array' });
    return { isValid: false, errors };
  }

  // Validate each setting
  data.settings.forEach((setting, index) => {
    if (isEmpty(setting.key)) {
      errors.push({ 
        field: `settings[${index}].key`, 
        message: 'Setting key is required' 
      });
    }

    if (setting.value === undefined || setting.value === null) {
      errors.push({ 
        field: `settings[${index}].value`, 
        message: 'Setting value is required' 
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate setting value based on type
 */
function validateSettingValue(type, value) {
  const errors = [];

  switch (type) {
    case 'number':
      if (isNaN(Number(value))) {
        errors.push({ field: 'value', message: 'Value must be a number' });
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        errors.push({ field: 'value', message: 'Value must be a boolean' });
      }
      break;

    case 'json':
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        } else if (typeof value !== 'object') {
          errors.push({ field: 'value', message: 'Value must be a valid JSON object' });
        }
      } catch (e) {
        errors.push({ field: 'value', message: 'Value must be valid JSON' });
      }
      break;

    case 'string':
      if (typeof value !== 'string') {
        errors.push({ field: 'value', message: 'Value must be a string' });
      }
      break;

    default:
      // No validation for unknown types
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateSettingUpdate,
  validateBulkSettingsUpdate,
  validateSettingValue
};
