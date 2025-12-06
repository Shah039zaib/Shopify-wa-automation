/**
 * Customer Routes
 * Customer management endpoints
 */

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody, validateParams, validateQuery } = require('../middleware/validate.middleware');

/**
 * GET /api/customers
 * Get all customers with pagination
 */
router.get(
  '/',
  requireAuth,
  validateQuery({
    page: { type: 'number' },
    limit: { type: 'number' },
    search: { type: 'string' }
  }),
  customerController.getCustomers
);

/**
 * GET /api/customers/:id
 * Get single customer
 */
router.get(
  '/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  customerController.getCustomer
);

/**
 * POST /api/customers
 * Create new customer
 */
router.post(
  '/',
  requireAuth,
  validateBody({
    phone_number: { required: true, phone: true },
    name: { required: false },
    email: { required: false, email: true }
  }),
  customerController.createCustomer
);

/**
 * PUT /api/customers/:id
 * Update customer
 */
router.put(
  '/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  customerController.updateCustomer
);

/**
 * DELETE /api/customers/:id
 * Delete customer
 */
router.delete(
  '/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  customerController.deleteCustomer
);

/**
 * GET /api/customers/:id/stats
 * Get customer statistics
 */
router.get(
  '/:id/stats',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  customerController.getCustomerStats
);

/**
 * GET /api/customers/search
 * Search customers
 */
router.get('/search', requireAuth, customerController.searchCustomers);

module.exports = router;
