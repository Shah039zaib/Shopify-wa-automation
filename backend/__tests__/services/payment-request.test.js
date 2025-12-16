/**
 * Payment Request Service Tests
 */

// Mock all dependencies before requiring the service
jest.mock('../../src/models/PaymentMethod', () => ({
  formatForCustomer: jest.fn()
}));

jest.mock('../../src/models/Customer', () => ({
  findById: jest.fn()
}));

jest.mock('../../src/models/Order', () => ({
  findById: jest.fn(),
  updateStatus: jest.fn(),
  getByCustomer: jest.fn(),
  updatePaymentScreenshot: jest.fn()
}));

jest.mock('../../src/models/Package', () => ({
  findById: jest.fn()
}));

jest.mock('../../src/models/Setting', () => ({
  get: jest.fn()
}));

jest.mock('../../src/models/WhatsAppAccount', () => ({
  getAll: jest.fn()
}));

jest.mock('../../src/services/whatsapp.service', () => ({
  sendMessage: jest.fn()
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    whatsapp: jest.fn()
  }
}));

describe('Payment Request Service', () => {
  let paymentRequestService;
  let PaymentMethod;
  let Customer;
  let Order;
  let Package;
  let Setting;
  let WhatsAppAccount;
  let whatsappService;

  beforeAll(() => {
    PaymentMethod = require('../../src/models/PaymentMethod');
    Customer = require('../../src/models/Customer');
    Order = require('../../src/models/Order');
    Package = require('../../src/models/Package');
    Setting = require('../../src/models/Setting');
    WhatsAppAccount = require('../../src/models/WhatsAppAccount');
    whatsappService = require('../../src/services/whatsapp.service');
    paymentRequestService = require('../../src/services/payment-request.service');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPaymentRequest', () => {
    it('should send payment request successfully', async () => {
      Order.findById.mockResolvedValue({
        id: 'order-1',
        customer_id: 'customer-1',
        package_id: 'package-1',
        amount: 5000
      });

      Customer.findById.mockResolvedValue({
        id: 'customer-1',
        name: 'Ali',
        phone_number: '03001234567',
        language_preference: 'urdu'
      });

      Package.findById.mockResolvedValue({
        id: 'package-1',
        name: 'Premium',
        delivery_days: 3
      });

      WhatsAppAccount.getAll.mockResolvedValue([
        { id: 'wa-1', status: 'ready' }
      ]);

      PaymentMethod.formatForCustomer.mockResolvedValue('Payment details');
      Setting.get.mockResolvedValue('Business Name');
      whatsappService.sendMessage.mockResolvedValue(true);
      Order.updateStatus.mockResolvedValue({ status: 'payment_pending' });

      const result = await paymentRequestService.sendPaymentRequest('order-1');

      expect(result.success).toBe(true);
      expect(whatsappService.sendMessage).toHaveBeenCalled();
    });

    it('should fail if order not found', async () => {
      Order.findById.mockResolvedValue(null);

      const result = await paymentRequestService.sendPaymentRequest('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order not found');
    });

    it('should fail if no active WhatsApp account', async () => {
      Order.findById.mockResolvedValue({ id: 'order-1', customer_id: 'c1', package_id: 'p1' });
      Customer.findById.mockResolvedValue({ id: 'c1', phone_number: '03001234567' });
      Package.findById.mockResolvedValue({ id: 'p1', name: 'Test' });
      WhatsAppAccount.getAll.mockResolvedValue([
        { id: 'wa-1', status: 'disconnected' }
      ]);

      const result = await paymentRequestService.sendPaymentRequest('order-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No active WhatsApp account');
    });
  });

  describe('processPaymentScreenshot', () => {
    it('should process payment screenshot', async () => {
      Order.getByCustomer.mockResolvedValue([
        { id: 'order-1', status: 'payment_pending' }
      ]);

      Order.updatePaymentScreenshot.mockResolvedValue(true);
      Order.updateStatus.mockResolvedValue({ status: 'payment_verification' });

      Customer.findById.mockResolvedValue({
        id: 'customer-1',
        phone_number: '03001234567',
        language_preference: 'urdu'
      });

      WhatsAppAccount.getAll.mockResolvedValue([{ id: 'wa-1', status: 'ready' }]);
      whatsappService.sendMessage.mockResolvedValue(true);

      const result = await paymentRequestService.processPaymentScreenshot(
        'conv-1',
        'customer-1',
        'data:image/png;base64,abc123'
      );

      expect(result.success).toBe(true);
      expect(Order.updatePaymentScreenshot).toHaveBeenCalled();
    });

    it('should fail if no pending order', async () => {
      Order.getByCustomer.mockResolvedValue([
        { id: 'order-1', status: 'completed' }
      ]);

      const result = await paymentRequestService.processPaymentScreenshot(
        'conv-1',
        'customer-1',
        'data:image/png;base64,abc123'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('No pending order');
    });
  });
});
