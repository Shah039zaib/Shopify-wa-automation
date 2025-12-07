/**
 * Analytics DTOs
 * Data Transfer Objects for analytics
 */

const { formatPrice, formatPercentage, formatDuration } = require('../utils/formatters');

/**
 * Format conversation analytics
 */
function formatConversationAnalytics(stats) {
  return {
    total_conversations: parseInt(stats.total_conversations) || 0,
    unique_customers: parseInt(stats.unique_customers) || 0,
    active_conversations: parseInt(stats.active_conversations) || 0,
    closed_conversations: parseInt(stats.closed_conversations) || 0,
    avg_messages_per_conversation: parseFloat(stats.avg_messages_per_conversation || 0).toFixed(2),
    avg_duration_minutes: parseFloat(stats.avg_duration_minutes || 0).toFixed(2),
    avg_duration_formatted: formatDuration(parseFloat(stats.avg_duration_minutes || 0) * 60)
  };
}

/**
 * Format sales analytics
 */
function formatSalesAnalytics(stats) {
  return {
    total_orders: parseInt(stats.total_orders) || 0,
    pending_orders: parseInt(stats.pending_orders) || 0,
    successful_orders: parseInt(stats.successful_orders) || 0,
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

/**
 * Format AI analytics
 */
function formatAIAnalytics(stats) {
  return {
    total_requests: parseInt(stats.total_requests) || 0,
    successful_requests: parseInt(stats.successful_requests) || 0,
    failed_requests: parseInt(stats.failed_requests) || 0,
    success_rate: parseFloat(stats.success_rate || 0).toFixed(2),
    success_rate_formatted: formatPercentage(stats.success_rate || 0),
    avg_response_time: parseFloat(stats.avg_response_time || 0).toFixed(2),
    avg_response_time_formatted: `${parseFloat(stats.avg_response_time || 0).toFixed(0)}ms`,
    total_tokens: parseInt(stats.total_tokens) || 0,
    avg_tokens_per_request: parseFloat(stats.avg_tokens_per_request || 0).toFixed(2)
  };
}

/**
 * Format customer analytics
 */
function formatCustomerAnalytics(stats) {
  return {
    total_customers: parseInt(stats.total_customers) || 0,
    new_customers_this_month: parseInt(stats.new_customers_this_month) || 0,
    active_customers: parseInt(stats.active_customers) || 0,
    avg_orders_per_customer: parseFloat(stats.avg_orders_per_customer || 0).toFixed(2),
    avg_customer_value: parseFloat(stats.avg_customer_value) || 0,
    avg_customer_value_formatted: formatPrice(stats.avg_customer_value || 0)
  };
}

/**
 * Format conversion funnel
 */
function formatConversionFunnel(funnel) {
  return {
    stages: funnel.stages.map(stage => ({
      name: stage.name,
      count: stage.count,
      percentage: formatPercentage(stage.percentage)
    })),
    overall_conversion: formatPercentage(funnel.overallConversion)
  };
}

module.exports = {
  formatConversationAnalytics,
  formatSalesAnalytics,
  formatAIAnalytics,
  formatCustomerAnalytics,
  formatConversionFunnel
};
