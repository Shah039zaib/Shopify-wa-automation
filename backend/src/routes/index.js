/**
 * Routes Index
 * Aggregates and exports all API routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const whatsappRoutes = require('./whatsapp.routes');
const customerRoutes = require('./customer.routes');
const conversationRoutes = require('./conversation.routes');
const messageRoutes = require('./message.routes');
const aiRoutes = require('./ai.routes');
const paymentRoutes = require('./payment.routes');
const orderRoutes = require('./order.routes');
const packageRoutes = require('./package.routes');
const templateRoutes = require('./template.routes');
const analyticsRoutes = require('./analytics.routes');
const settingsRoutes = require('./settings.routes');
const exportRoutes = require('./export.routes');

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/customers', customerRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/ai', aiRoutes);
router.use('/payments', paymentRoutes);
router.use('/orders', orderRoutes);
router.use('/packages', packageRoutes);
router.use('/templates', templateRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);
router.use('/export', exportRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WhatsApp Automation API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      whatsapp: '/api/whatsapp',
      customers: '/api/customers',
      conversations: '/api/conversations',
      messages: '/api/messages',
      ai: '/api/ai',
      payments: '/api/payments',
      orders: '/api/orders',
      packages: '/api/packages',
      templates: '/api/templates',
      analytics: '/api/analytics',
      settings: '/api/settings',
      export: '/api/export'
    }
  });
});

module.exports = router;
