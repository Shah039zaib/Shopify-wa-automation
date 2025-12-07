/**
 * Order Validators
 * Order data validation
 */

const { isValidUUID, isValidPrice, isEmpty } = require('../utils/validators');

/**
 * Validate create order
 */
function validateCreateOrder(data) {
  const errors = [];

  // Customer ID validation
  if (isEmpty(data.customer_id)) {
    errors.push({ field: 'customer_id', message: 'Customer ID is required' });
  } else if (!isValidUUID(data.customer_id)) {
    errors.push({ field: 'customer_id', message: 'Invalid customer ID format' });
  }

  // Package ID validation
  if (isEmpty(data.package_id)) {
    errors.push({ field: 'package_id', message: 'Package ID is required' });
  } else if (!isValidUUID(data.package_id)) {
    errors.push({ field: 'package_id', message: 'Invalid package ID format' });
  }

  // Amount validation
  if (data.amount === undefined || data.amount === null) {
    errors.push({ field: 'amount', message: 'Amount is required' });
  } else if (!isValidPrice(data.amount)) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number' });
  } else if (data.amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate update order status
 */
function validateUpdateOrderStatus(data) {
  const errors = [];

  const validStatuses = [
    'pending',
    'payment_pending',
    'paid',
    'in_progress',
    'completed',
    'cancelled',
    'refunded'
  ];

  if (isEmpty(data.status)) {
    errors.push({ field: 'status', message: 'Status is required' });
  } else if (!validStatuses.includes(data.status)) {
    errors.push({ 
      field: 'status', 
      message: `Status must be one of: ${validStatuses.join(', ')}` 
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateCreateOrder,
  validateUpdateOrderStatus
};
