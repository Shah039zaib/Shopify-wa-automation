/**
 * Order Controller
 * Order management logic
 */

const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Package = require('../models/Package');
const { NotFoundError, BadRequestError } = require('../utils/error-handler');

/**
 * Get all orders
 * GET /api/orders
 */
exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, customer_id } = req.query;

    const result = await Order.getAll({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      customer_id
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order
 * GET /api/orders/:id
 */
exports.getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new order
 * POST /api/orders
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { customer_id, package_id, amount } = req.body;

    // Verify customer exists
    const customer = await Customer.findById(customer_id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Verify package exists
    const pkg = await Package.findById(package_id);
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    const order = await Order.create({
      customer_id,
      package_id,
      amount
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status
 * PUT /api/orders/:id/status
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const updated = await Order.updateStatus(id, status);

    // If status is completed, update customer stats
    if (status === 'completed') {
      await Customer.incrementOrderStats(order.customer_id, order.amount);
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update payment screenshot
 * PUT /api/orders/:id/payment-screenshot
 */
exports.updatePaymentScreenshot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { screenshot_url } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const updated = await Order.updatePaymentScreenshot(id, screenshot_url);

    res.json({
      success: true,
      message: 'Payment screenshot updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update store details
 * PUT /api/orders/:id/store-details
 */
exports.updateStoreDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const storeDetails = req.body;

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const updated = await Order.updateStoreDetails(id, storeDetails);

    res.json({
      success: true,
      message: 'Store details updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete order
 * DELETE /api/orders/:id
 */
exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    await Order.delete(id);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue statistics
 * GET /api/orders/stats/revenue
 */
exports.getRevenueStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const stats = await Order.getRevenueStats(start_date, end_date);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent orders
 * GET /api/orders/recent
 */
exports.getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.getRecent(10);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};
