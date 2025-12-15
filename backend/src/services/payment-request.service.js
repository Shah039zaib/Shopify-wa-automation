/**
 * Payment Request Service
 * Handles automatic payment request sending to customers
 */

const PaymentMethod = require('../models/PaymentMethod');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Package = require('../models/Package');
const Setting = require('../models/Setting');
const whatsappService = require('./whatsapp.service');
const { logger } = require('../utils/logger');

/**
 * Generate payment request message for customer
 */
async function generatePaymentMessage(order, customer, pkg, language = 'urdu') {
  // Get active payment methods
  const paymentDetails = await PaymentMethod.formatForCustomer();

  // Get business name from settings
  const businessName = await Setting.get('business_name', 'Shopify Store Service');

  // Create message based on language
  if (language === 'urdu' || language === 'roman_urdu') {
    return `Assalam o Alaikum ${customer.name || 'Customer'}! 🙏

Aap ka order confirm ho gya hai! ✅

📦 *Order Details:*
Package: ${pkg.name}
Amount: Rs. ${order.amount}/-

Ab payment karne ke liye ye details use karein:
${paymentDetails}

⚠️ *Instructions:*
1. Payment karne ke baad screenshot yahan bhej dein
2. Order ${pkg.delivery_days || 3}-${(pkg.delivery_days || 3) + 2} din mein deliver ho jayega

Shukriya! 🙏
${businessName}`;
  }

  // English message
  return `Hello ${customer.name || 'Customer'}! 🙏

Your order has been confirmed! ✅

📦 *Order Details:*
Package: ${pkg.name}
Amount: Rs. ${order.amount}/-

Please make payment using these details:
${paymentDetails}

⚠️ *Instructions:*
1. After payment, please send the screenshot here
2. Order will be delivered in ${pkg.delivery_days || 3}-${(pkg.delivery_days || 3) + 2} days

Thank you! 🙏
${businessName}`;
}

/**
 * Send payment request to customer
 */
async function sendPaymentRequest(orderId) {
  try {
    logger.info(`Sending payment request for order: ${orderId}`);

    // Get order with details
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Get customer
    const customer = await Customer.findById(order.customer_id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get package
    const pkg = await Package.findById(order.package_id);
    if (!pkg) {
      throw new Error('Package not found');
    }

    // Generate message
    const message = await generatePaymentMessage(
      order,
      customer,
      pkg,
      customer.language_preference
    );

    // Get WhatsApp account to use
    const WhatsAppAccount = require('../models/WhatsAppAccount');
    const accounts = await WhatsAppAccount.getAll();
    const activeAccount = accounts.find(a => a.status === 'ready');

    if (!activeAccount) {
      logger.error('No active WhatsApp account found for payment request');
      return {
        success: false,
        error: 'No active WhatsApp account'
      };
    }

    // Send message via WhatsApp
    await whatsappService.sendMessage(
      activeAccount.id,
      customer.phone_number,
      message,
      { showTyping: true }
    );

    // Update order status to payment_pending
    await Order.updateStatus(orderId, 'payment_pending');

    logger.info(`Payment request sent for order: ${orderId}`);

    // Emit event to frontend
    if (global.io) {
      global.io.emit('payment_request_sent', {
        order_id: orderId,
        customer_id: customer.id,
        phone_number: customer.phone_number
      });
    }

    return {
      success: true,
      order_id: orderId,
      message: 'Payment request sent successfully'
    };

  } catch (error) {
    logger.error(`Failed to send payment request for order ${orderId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send payment reminder to customer
 */
async function sendPaymentReminder(orderId, reminderNumber = 1) {
  try {
    logger.info(`Sending payment reminder ${reminderNumber} for order: ${orderId}`);

    // Get order with details
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Don't send reminder if already paid
    if (['paid', 'completed'].includes(order.status)) {
      return {
        success: false,
        error: 'Order already paid'
      };
    }

    // Get customer
    const customer = await Customer.findById(order.customer_id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get package
    const pkg = await Package.findById(order.package_id);

    // Create reminder message based on language
    let message;
    if (customer.language_preference === 'urdu' || customer.language_preference === 'roman_urdu') {
      message = `Assalam o Alaikum ${customer.name || 'Customer'}! 👋

Ye aap ke order ka reminder hai:

📦 Package: ${pkg?.name || 'N/A'}
💰 Amount: Rs. ${order.amount}/-

Agar aap ne payment kar di hai to screenshot bhej dein.
Agar koi sawal hai to pooch lein! 🙏`;
    } else {
      message = `Hello ${customer.name || 'Customer'}! 👋

This is a reminder for your order:

📦 Package: ${pkg?.name || 'N/A'}
💰 Amount: Rs. ${order.amount}/-

If you have made the payment, please send the screenshot.
Feel free to ask if you have any questions! 🙏`;
    }

    // Get WhatsApp account
    const WhatsAppAccount = require('../models/WhatsAppAccount');
    const accounts = await WhatsAppAccount.getAll();
    const activeAccount = accounts.find(a => a.status === 'ready');

    if (!activeAccount) {
      logger.error('No active WhatsApp account found for payment reminder');
      return {
        success: false,
        error: 'No active WhatsApp account'
      };
    }

    // Send message
    await whatsappService.sendMessage(
      activeAccount.id,
      customer.phone_number,
      message,
      { showTyping: true }
    );

    logger.info(`Payment reminder ${reminderNumber} sent for order: ${orderId}`);

    return {
      success: true,
      order_id: orderId,
      reminder_number: reminderNumber,
      message: 'Payment reminder sent successfully'
    };

  } catch (error) {
    logger.error(`Failed to send payment reminder for order ${orderId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send payment confirmation to customer
 */
async function sendPaymentConfirmation(orderId) {
  try {
    logger.info(`Sending payment confirmation for order: ${orderId}`);

    // Get order with details
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Get customer
    const customer = await Customer.findById(order.customer_id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get package
    const pkg = await Package.findById(order.package_id);

    // Get business name
    const businessName = await Setting.get('business_name', 'Shopify Store Service');

    // Create confirmation message
    let message;
    if (customer.language_preference === 'urdu' || customer.language_preference === 'roman_urdu') {
      message = `✅ *Payment Received!*

Shukriya ${customer.name || 'Customer'}! Aap ki payment confirm ho gayi hai.

📦 Package: ${pkg?.name || 'N/A'}
💰 Amount: Rs. ${order.amount}/-

Aap ka order process ho raha hai aur ${pkg?.delivery_days || 3}-${(pkg?.delivery_days || 3) + 2} din mein deliver ho jayega.

Koi bhi sawal ho to pooch lein! 🙏
${businessName}`;
    } else {
      message = `✅ *Payment Received!*

Thank you ${customer.name || 'Customer'}! Your payment has been confirmed.

📦 Package: ${pkg?.name || 'N/A'}
💰 Amount: Rs. ${order.amount}/-

Your order is being processed and will be delivered in ${pkg?.delivery_days || 3}-${(pkg?.delivery_days || 3) + 2} days.

Feel free to ask if you have any questions! 🙏
${businessName}`;
    }

    // Get WhatsApp account
    const WhatsAppAccount = require('../models/WhatsAppAccount');
    const accounts = await WhatsAppAccount.getAll();
    const activeAccount = accounts.find(a => a.status === 'ready');

    if (!activeAccount) {
      logger.error('No active WhatsApp account found for payment confirmation');
      return {
        success: false,
        error: 'No active WhatsApp account'
      };
    }

    // Send message
    await whatsappService.sendMessage(
      activeAccount.id,
      customer.phone_number,
      message,
      { showTyping: true }
    );

    logger.info(`Payment confirmation sent for order: ${orderId}`);

    // Emit event to frontend
    if (global.io) {
      global.io.emit('payment_confirmed', {
        order_id: orderId,
        customer_id: customer.id
      });
    }

    return {
      success: true,
      order_id: orderId,
      message: 'Payment confirmation sent successfully'
    };

  } catch (error) {
    logger.error(`Failed to send payment confirmation for order ${orderId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Process payment screenshot from customer message
 */
async function processPaymentScreenshot(conversationId, customerId, mediaUrl) {
  try {
    logger.info(`Processing payment screenshot from customer: ${customerId}`);

    // Get customer's pending order
    const orders = await Order.getByCustomer(customerId);
    const pendingOrder = orders.find(o => o.status === 'payment_pending');

    if (!pendingOrder) {
      return {
        success: false,
        error: 'No pending order found for customer'
      };
    }

    // Update order with screenshot
    await Order.updatePaymentScreenshot(pendingOrder.id, mediaUrl);
    await Order.updateStatus(pendingOrder.id, 'payment_verification');

    logger.info(`Payment screenshot saved for order: ${pendingOrder.id}`);

    // Notify admin via socket
    if (global.io) {
      global.io.emit('payment_screenshot_received', {
        order_id: pendingOrder.id,
        customer_id: customerId,
        screenshot_url: mediaUrl
      });
    }

    // Get customer for thank you message
    const customer = await Customer.findById(customerId);

    // Send thank you message
    let message;
    if (customer?.language_preference === 'urdu' || customer?.language_preference === 'roman_urdu') {
      message = `Shukriya! 🙏

Aap ki payment screenshot mil gayi hai. Hum jaldi verify karke aap ko batayenge.

Please thoda intezaar karein... ⏳`;
    } else {
      message = `Thank you! 🙏

We have received your payment screenshot. We will verify and update you shortly.

Please wait... ⏳`;
    }

    // Get WhatsApp account
    const WhatsAppAccount = require('../models/WhatsAppAccount');
    const accounts = await WhatsAppAccount.getAll();
    const activeAccount = accounts.find(a => a.status === 'ready');

    if (activeAccount && customer) {
      await whatsappService.sendMessage(
        activeAccount.id,
        customer.phone_number,
        message,
        { showTyping: true }
      );
    }

    return {
      success: true,
      order_id: pendingOrder.id,
      message: 'Payment screenshot received'
    };

  } catch (error) {
    logger.error(`Failed to process payment screenshot:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  generatePaymentMessage,
  sendPaymentRequest,
  sendPaymentReminder,
  sendPaymentConfirmation,
  processPaymentScreenshot
};
