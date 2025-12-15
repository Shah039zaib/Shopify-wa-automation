/**
 * Export Controller
 * Handles report generation and file downloads
 */

const exportService = require('../services/export.service');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Conversation = require('../models/Conversation');
const SalesAnalytics = require('../models/SalesAnalytics');
const AIAnalytics = require('../models/AIAnalytics');
const { logger } = require('../utils/logger');

/**
 * Export customers report
 */
async function exportCustomers(req, res) {
  try {
    const { format = 'csv' } = req.query;

    // Get all customers
    const result = await Customer.getAll({ limit: 10000 });
    const customers = result.data || result;

    let content, contentType, filename;

    switch (format.toLowerCase()) {
      case 'csv':
        content = await exportService.exportCustomersCSV(customers);
        contentType = 'text/csv';
        filename = `customers_${Date.now()}.csv`;
        break;

      case 'json':
        content = exportService.toJSON(customers);
        contentType = 'application/json';
        filename = `customers_${Date.now()}.json`;
        break;

      case 'html':
      case 'pdf':
        content = exportService.toHTML('Customers Report', customers, [
          'name', 'phone_number', 'email', 'language_preference',
          'status', 'total_orders', 'total_spent'
        ]);
        contentType = 'text/html';
        filename = `customers_${Date.now()}.html`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Use csv, json, or html'
        });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);

  } catch (error) {
    logger.error('Export customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export customers'
    });
  }
}

/**
 * Export orders report
 */
async function exportOrders(req, res) {
  try {
    const { format = 'csv', status } = req.query;

    // Get all orders
    const result = await Order.getAll({ limit: 10000, status });
    const orders = result.data || result;

    let content, contentType, filename;

    switch (format.toLowerCase()) {
      case 'csv':
        content = await exportService.exportOrdersCSV(orders);
        contentType = 'text/csv';
        filename = `orders_${Date.now()}.csv`;
        break;

      case 'json':
        content = exportService.toJSON(orders);
        contentType = 'application/json';
        filename = `orders_${Date.now()}.json`;
        break;

      case 'html':
      case 'pdf':
        content = exportService.toHTML('Orders Report', orders, [
          'id', 'customer_name', 'package_name', 'amount', 'status', 'created_at'
        ]);
        contentType = 'text/html';
        filename = `orders_${Date.now()}.html`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Use csv, json, or html'
        });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);

  } catch (error) {
    logger.error('Export orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export orders'
    });
  }
}

/**
 * Export conversations report
 */
async function exportConversations(req, res) {
  try {
    const { format = 'csv', status } = req.query;

    // Get all conversations
    const result = await Conversation.getAll({ limit: 10000, status });
    const conversations = result.data || result;

    let content, contentType, filename;

    switch (format.toLowerCase()) {
      case 'csv':
        content = await exportService.exportConversationsCSV(conversations);
        contentType = 'text/csv';
        filename = `conversations_${Date.now()}.csv`;
        break;

      case 'json':
        content = exportService.toJSON(conversations);
        contentType = 'application/json';
        filename = `conversations_${Date.now()}.json`;
        break;

      case 'html':
      case 'pdf':
        content = exportService.toHTML('Conversations Report', conversations, [
          'id', 'customer_name', 'phone_number', 'status', 'messages_count', 'last_message_at'
        ]);
        contentType = 'text/html';
        filename = `conversations_${Date.now()}.html`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Use csv, json, or html'
        });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);

  } catch (error) {
    logger.error('Export conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export conversations'
    });
  }
}

/**
 * Export sales analytics report
 */
async function exportSalesReport(req, res) {
  try {
    const { format = 'csv', days = 30 } = req.query;

    // Get sales data
    const salesData = await SalesAnalytics.getDailyRevenue(parseInt(days));

    let content, contentType, filename;

    switch (format.toLowerCase()) {
      case 'csv':
        content = await exportService.exportSalesReportCSV(salesData);
        contentType = 'text/csv';
        filename = `sales_report_${Date.now()}.csv`;
        break;

      case 'json':
        content = exportService.toJSON(salesData);
        contentType = 'application/json';
        filename = `sales_report_${Date.now()}.json`;
        break;

      case 'html':
      case 'pdf':
        content = exportService.toHTML('Sales Analytics Report', salesData, [
          'date', 'order_count', 'revenue', 'confirmed_revenue'
        ]);
        contentType = 'text/html';
        filename = `sales_report_${Date.now()}.html`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Use csv, json, or html'
        });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);

  } catch (error) {
    logger.error('Export sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export sales report'
    });
  }
}

/**
 * Export AI analytics report
 */
async function exportAIReport(req, res) {
  try {
    const { format = 'csv' } = req.query;

    // Get AI performance data
    const aiData = await AIAnalytics.getProviderComparison();

    let content, contentType, filename;

    switch (format.toLowerCase()) {
      case 'csv':
        content = await exportService.exportAIReportCSV(aiData);
        contentType = 'text/csv';
        filename = `ai_report_${Date.now()}.csv`;
        break;

      case 'json':
        content = exportService.toJSON(aiData);
        contentType = 'application/json';
        filename = `ai_report_${Date.now()}.json`;
        break;

      case 'html':
      case 'pdf':
        content = exportService.toHTML('AI Performance Report', aiData, [
          'provider_name', 'total_requests', 'successful_requests',
          'success_rate', 'avg_response_time'
        ]);
        contentType = 'text/html';
        filename = `ai_report_${Date.now()}.html`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Use csv, json, or html'
        });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);

  } catch (error) {
    logger.error('Export AI report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export AI report'
    });
  }
}

module.exports = {
  exportCustomers,
  exportOrders,
  exportConversations,
  exportSalesReport,
  exportAIReport
};
