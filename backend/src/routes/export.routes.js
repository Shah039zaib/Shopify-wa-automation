/**
 * Export Routes
 * API endpoints for downloading reports
 */

const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All export routes require authentication
router.use(authenticate);

/**
 * @route GET /api/export/customers
 * @query format - csv, json, html
 * @desc Export customers data
 */
router.get('/customers', exportController.exportCustomers);

/**
 * @route GET /api/export/orders
 * @query format - csv, json, html
 * @query status - filter by status
 * @desc Export orders data
 */
router.get('/orders', exportController.exportOrders);

/**
 * @route GET /api/export/conversations
 * @query format - csv, json, html
 * @query status - filter by status
 * @desc Export conversations data
 */
router.get('/conversations', exportController.exportConversations);

/**
 * @route GET /api/export/sales
 * @query format - csv, json, html
 * @query days - number of days (default 30)
 * @desc Export sales analytics
 */
router.get('/sales', exportController.exportSalesReport);

/**
 * @route GET /api/export/ai
 * @query format - csv, json, html
 * @desc Export AI performance analytics
 */
router.get('/ai', exportController.exportAIReport);

module.exports = router;
