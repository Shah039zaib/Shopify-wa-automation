/**
 * Package Validators
 * Package data validation
 */

const { isValidPrice, isEmpty } = require('../utils/validators');

/**
 * Validate create package
 */
function validateCreatePackage(data) {
  const errors = [];

  // Name validation
  if (isEmpty(data.name)) {
    errors.push({ field: 'name', message: 'Package name is required' });
  } else if (data.name.length < 3) {
    errors.push({ field: 'name', message: 'Package name must be at least 3 characters' });
  }

  // Description validation
  if (isEmpty(data.description)) {
    errors.push({ field: 'description', message: 'Package description is required' });
  } else if (data.description.length < 10) {
    errors.push({ field: 'description', message: 'Package description must be at least 10 characters' });
  }

  // Price validation
  if (data.price === undefined || data.price === null) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else if (!isValidPrice(data.price)) {
    errors.push({ field: 'price', message: 'Price must be a valid positive number' });
  } else if (data.price < 0) {
    errors.push({ field: 'price', message: 'Price cannot be negative' });
  }

  // Features validation
  if (!data.features) {
    errors.push({ field: 'features', message: 'Features are required' });
  } else if (!Array.isArray(data.features)) {
    errors.push({ field: 'features', message: 'Features must be an array' });
  } else if (data.features.length === 0) {
    errors.push({ field: 'features', message: 'At least one feature is required' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate update package
 */
function validateUpdatePackage(data) {
  const errors = [];

  // Name validation (if provided)
  if (data.name !== undefined && data.name.length < 3) {
    errors.push({ field: 'name', message: 'Package name must be at least 3 characters' });
  }

  // Description validation (if provided)
  if (data.description !== undefined && data.description.length < 10) {
    errors.push({ field: 'description', message: 'Package description must be at least 10 characters' });
  }

  // Price validation (if provided)
  if (data.price !== undefined) {
    if (!isValidPrice(data.price)) {
      errors.push({ field: 'price', message: 'Price must be a valid positive number' });
    } else if (data.price < 0) {
      errors.push({ field: 'price', message: 'Price cannot be negative' });
    }
  }

  // Features validation (if provided)
  if (data.features !== undefined) {
    if (!Array.isArray(data.features)) {
      errors.push({ field: 'features', message: 'Features must be an array' });
    } else if (data.features.length === 0) {
      errors.push({ field: 'features', message: 'At least one feature is required' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateCreatePackage,
  validateUpdatePackage
};
