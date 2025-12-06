/**
 * Validation Middleware
 * Request data validation
 */

const { ValidationError } = require('../utils/error-handler');
const { 
  isValidEmail, 
  isValidPhone, 
  isValidUUID,
  isEmpty 
} = require('../utils/validators');

/**
 * Validate request body against schema
 */
function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Required check
      if (rules.required && (value === undefined || value === null || isEmpty(value))) {
        errors.push({
          field,
          message: `${field} is required`
        });
        continue;
      }

      // Skip other validations if field is not required and empty
      if (!rules.required && (value === undefined || value === null || isEmpty(value))) {
        continue;
      }

      // Type check
      if (rules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          errors.push({
            field,
            message: `${field} must be of type ${rules.type}`
          });
          continue;
        }
      }

      // Email validation
      if (rules.email && !isValidEmail(value)) {
        errors.push({
          field,
          message: `${field} must be a valid email`
        });
      }

      // Phone validation
      if (rules.phone && !isValidPhone(value)) {
        errors.push({
          field,
          message: `${field} must be a valid phone number`
        });
      }

      // UUID validation
      if (rules.uuid && !isValidUUID(value)) {
        errors.push({
          field,
          message: `${field} must be a valid UUID`
        });
      }

      // Min length
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({
          field,
          message: `${field} must be at least ${rules.minLength} characters`
        });
      }

      // Max length
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
          field,
          message: `${field} must not exceed ${rules.maxLength} characters`
        });
      }

      // Min value (for numbers)
      if (rules.min !== undefined && value < rules.min) {
        errors.push({
          field,
          message: `${field} must be at least ${rules.min}`
        });
      }

      // Max value (for numbers)
      if (rules.max !== undefined && value > rules.max) {
        errors.push({
          field,
          message: `${field} must not exceed ${rules.max}`
        });
      }

      // Enum check
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field,
          message: `${field} must be one of: ${rules.enum.join(', ')}`
        });
      }

      // Custom validation function
      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(value);
        if (customError) {
          errors.push({
            field,
            message: customError
          });
        }
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError('Validation failed', errors));
    }

    next();
  };
}

/**
 * Validate query parameters
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.query[field];

      if (rules.required && !value) {
        errors.push({
          field,
          message: `${field} query parameter is required`
        });
        continue;
      }

      if (!value) continue;

      // Type conversion and validation
      if (rules.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push({
            field,
            message: `${field} must be a number`
          });
        } else {
          req.query[field] = num;
        }
      }

      if (rules.type === 'boolean') {
        req.query[field] = value === 'true';
      }

      // Enum check
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field,
          message: `${field} must be one of: ${rules.enum.join(', ')}`
        });
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError('Query validation failed', errors));
    }

    next();
  };
}

/**
 * Validate URL parameters
 */
function validateParams(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.params[field];

      if (rules.required && !value) {
        errors.push({
          field,
          message: `${field} parameter is required`
        });
        continue;
      }

      // UUID validation
      if (rules.uuid && !isValidUUID(value)) {
        errors.push({
          field,
          message: `${field} must be a valid UUID`
        });
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError('Parameter validation failed', errors));
    }

    next();
  };
}

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
