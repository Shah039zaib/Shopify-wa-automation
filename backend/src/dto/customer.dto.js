/**
 * Customer DTOs
 * Data Transfer Objects for customers
 */

const { formatPhone, formatRelativeTime } = require('../utils/formatters');

/**
 * Format customer response
 */
function formatCustomerResponse(customer) {
  return {
    id: customer.id,
    phone_number: formatPhone(customer.phone_number),
    name: customer.name,
    email: customer.email,
    language_preference: customer.language_preference,
    tags: customer.tags,
    total_orders: customer.total_orders,
    total_spent: customer.total_spent,
    last_interaction: customer.last_interaction,
    last_interaction_relative: customer.last_interaction 
      ? formatRelativeTime(customer.last_interaction) 
      : null,
    created_at: customer.created_at,
    updated_at: customer.updated_at
  };
}

/**
 * Format customer list response
 */
function formatCustomerList(customers) {
  return customers.map(formatCustomerResponse);
}

/**
 * Format customer stats response
 */
function formatCustomerStats(stats) {
  return {
    id: stats.id,
    name: stats.name,
    phone_number: formatPhone(stats.phone_number),
    total_orders: parseInt(stats.total_orders) || 0,
    total_spent: parseFloat(stats.total_spent) || 0,
    conversation_count: parseInt(stats.conversation_count) || 0,
    order_count: parseInt(stats.order_count) || 0,
    total_revenue: parseFloat(stats.total_revenue) || 0
  };
}

module.exports = {
  formatCustomerResponse,
  formatCustomerList,
  formatCustomerStats
};
