/**
 * Order Controller
 * Order management logic
 */

const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Package = require('../models/Package');
const paymentRequestService = require('../services/payment-request.service');
const { NotFoundError, BadRequestError } = require('../utils/error-handler');
const { logger } = require('../utils/logger');

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
    const { customer_id, package_id, amount, send_payment_request = true } = req.body;

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
      amount: amount || pkg.price
    });

    // Automatically send payment request if enabled
    let paymentRequestResult = null;
    if (send_payment_request) {
      try {
        paymentRequestResult = await paymentRequestService.sendPaymentRequest(order.id);
        logger.info(`Payment request sent for order: ${order.id}`);
      } catch (paymentError) {
        logger.error(`Failed to send payment request for order ${order.id}:`, paymentError);
        // Don't fail the order creation if payment request fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
      payment_request: paymentRequestResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send payment request for existing order
 * POST /api/orders/:id/send-payment-request
 */
exports.sendPaymentRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const result = await paymentRequestService.sendPaymentRequest(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Payment request sent successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send payment reminder
 * POST /api/orders/:id/send-reminder
 */
exports.sendPaymentReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reminder_number = 1 } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const result = await paymentRequestService.sendPaymentReminder(id, reminder_number);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Payment reminder sent successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm payment received
 * POST /api/orders/:id/confirm-payment
 */
exports.confirmPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Update order status to paid
    await Order.updateStatus(id, 'paid');

    // Update customer stats
    await Customer.incrementOrderStats(order.customer_id, order.amount);

    // Send confirmation message to customer
    const result = await paymentRequestService.sendPaymentConfirmation(id);

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        order_id: id,
        status: 'paid',
        confirmation_sent: result.success
      }
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
