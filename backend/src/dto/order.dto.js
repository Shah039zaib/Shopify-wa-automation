/**
 * Order DTOs
 * Data Transfer Objects for orders
 */

const { formatPrice, formatRelativeTime, formatOrderStatus } = require('../utils/formatters');

/**
 * Format order response
 */
function formatOrderResponse(order) {
  return {
    id: order.id,
    customer_id: order.customer_id,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    package_id: order.package_id,
    package_name: order.package_name,
    amount: order.amount,
    amount_formatted: formatPrice(order.amount),
    status: order.status,
    status_formatted: formatOrderStatus(order.status),
    payment_method_id: order.payment_method_id,
    payment_method_type: order.payment_method_type,
    payment_screenshot_url: order.payment_screenshot_url,
    store_details: order.store_details,
    created_at: order.created_at,
    created_at_relative: formatRelativeTime(order.created_at),
    paid_at: order.paid_at,
    completed_at: order.completed_at,
    updated_at: order.updated_at
  };
}

/**
 * Format order list response
 */
function formatOrderList(orders) {
  return orders.map(formatOrderResponse);
}

/**
 * Format revenue stats response
 */
function formatRevenueStats(stats) {
  return {
    total_orders: parseInt(stats.total_orders) || 0,
    pending_orders: parseInt(stats.pending_orders) || 0,
    paid_orders: parseInt(stats.paid_orders) || 0,
    completed_orders: parseInt(stats.completed_orders) || 0,
    total_revenue: parseFloat(stats.total_revenue) || 0,
    total_revenue_formatted: formatPrice(stats.total_revenue || 0),
    confirmed_revenue: parseFloat(stats.confirmed_revenue) || 0,
    confirmed_revenue_formatted: formatPrice(stats.confirmed_revenue || 0),
    avg_order_value: parseFloat(stats.avg_order_value) || 0,
    avg_order_value_formatted: formatPrice(stats.avg_order_value || 0),
    highest_order: parseFloat(stats.highest_order) || 0,
    lowest_order: parseFloat(stats.lowest_order) || 0
  };
}

module.exports = {
  formatOrderResponse,
  formatOrderList,
  formatRevenueStats
};
