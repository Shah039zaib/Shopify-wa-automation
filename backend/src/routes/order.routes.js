/**
 * Order Routes
 * Order management endpoints
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody, validateParams, validateQuery } = require('../middleware/validate.middleware');

/**
 * GET /api/orders
 * Get all orders
 */
router.get(
  '/',
  requireAuth,
  validateQuery({
    page: { type: 'number' },
    limit: { type: 'number' },
    status: { type: 'string' },
    customer_id: { type: 'string' }
  }),
  orderController.getOrders
);

/**
 * GET /api/orders/:id
 * Get single order
 */
router.get(
  '/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  orderController.getOrder
);

/**
 * POST /api/orders
 * Create new order
 */
router.post(
  '/',
  requireAuth,
  validateBody({
    customer_id: { required: true, uuid: true },
    package_id: { required: true, uuid: true },
    amount: { required: true, type: 'number', min: 0 }
  }),
  orderController.createOrder
);

/**
 * PUT /api/orders/:id/status
 * Update order status
 */
router.put(
  '/:id/status',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  validateBody({
    status: { 
      required: true, 
      enum: ['pending', 'payment_pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded'] 
    }
  }),
  orderController.updateStatus
);

/**
 * PUT /api/orders/:id/payment-screenshot
 * Update payment screenshot
 */
router.put(
  '/:id/payment-screenshot',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  validateBody({
    screenshot_url: { required: true }
  }),
  orderController.updatePaymentScreenshot
);

/**
 * PUT /api/orders/:id/store-details
 * Update store details
 */
router.put(
  '/:id/store-details',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  orderController.updateStoreDetails
);

/**
 * DELETE /api/orders/:id
 * Delete order
 */
router.delete(
  '/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  orderController.deleteOrder
);

/**
 * GET /api/orders/stats/revenue
 * Get revenue statistics
 */
router.get(
  '/stats/revenue',
  requireAuth,
  validateQuery({
    start_date: { type: 'string' },
    end_date: { type: 'string' }
  }),
  orderController.getRevenueStats
);

/**
 * GET /api/orders/recent
 * Get recent orders
 */
router.get('/recent', requireAuth, orderController.getRecentOrders);

module.exports = router;
