/**
 * Payment Request Service Tests
 */

// Mock dependencies
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
    whatsapp: jest.fn()
  }
}));

const PaymentMethod = require('../../src/models/PaymentMethod');
const Customer = require('../../src/models/Customer');
const Order = require('../../src/models/Order');
const Package = require('../../src/models/Package');
const Setting = require('../../src/models/Setting');
const WhatsAppAccount = require('../../src/models/WhatsAppAccount');
const whatsappService = require('../../src/services/whatsapp.service');
const paymentRequestService = require('../../src/services/payment-request.service');

describe('Payment Request Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePaymentMessage', () => {
    it('should generate Urdu payment message', async () => {
      PaymentMethod.formatForCustomer.mockResolvedValue('EasyPaisa: 03001234567');
      Setting.get.mockResolvedValue('Test Business');

      const order = { id: 'order-1', amount: 5000 };
      const customer = { name: 'Ali', language_preference: 'urdu' };
      const pkg = { name: 'Premium Package', delivery_days: 3 };

      const message = await paymentRequestService.generatePaymentMessage(
        order, customer, pkg, 'urdu'
      );

      expect(message).toContain('Assalam o Alaikum');
      expect(message).toContain('5000');
      expect(message).toContain('Premium Package');
    });

    it('should generate English payment message', async () => {
      PaymentMethod.formatForCustomer.mockResolvedValue('EasyPaisa: 03001234567');
      Setting.get.mockResolvedValue('Test Business');

      const order = { id: 'order-1', amount: 3000 };
      const customer = { name: 'John', language_preference: 'english' };
      const pkg = { name: 'Basic Package', delivery_days: 5 };

      const message = await paymentRequestService.generatePaymentMessage(
        order, customer, pkg, 'english'
      );

      expect(message).toContain('Hello');
      expect(message).toContain('3000');
      expect(message).toContain('Basic Package');
    });
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
      expect(Order.updateStatus).toHaveBeenCalledWith('order-1', 'payment_pending');
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

  describe('sendPaymentReminder', () => {
    it('should send payment reminder', async () => {
      Order.findById.mockResolvedValue({
        id: 'order-1',
        customer_id: 'customer-1',
        package_id: 'package-1',
        status: 'payment_pending',
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
        name: 'Premium'
      });

      WhatsAppAccount.getAll.mockResolvedValue([
        { id: 'wa-1', status: 'ready' }
      ]);

      whatsappService.sendMessage.mockResolvedValue(true);

      const result = await paymentRequestService.sendPaymentReminder('order-1', 1);

      expect(result.success).toBe(true);
      expect(result.reminder_number).toBe(1);
    });

    it('should not send reminder for paid order', async () => {
      Order.findById.mockResolvedValue({
        id: 'order-1',
        status: 'paid'
      });

      const result = await paymentRequestService.sendPaymentReminder('order-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('already paid');
    });
  });

  describe('sendPaymentConfirmation', () => {
    it('should send payment confirmation', async () => {
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
        language_preference: 'roman_urdu'
      });

      Package.findById.mockResolvedValue({
        id: 'package-1',
        name: 'Premium',
        delivery_days: 3
      });

      Setting.get.mockResolvedValue('Business Name');
      WhatsAppAccount.getAll.mockResolvedValue([{ id: 'wa-1', status: 'ready' }]);
      whatsappService.sendMessage.mockResolvedValue(true);

      const result = await paymentRequestService.sendPaymentConfirmation('order-1');

      expect(result.success).toBe(true);
      expect(whatsappService.sendMessage).toHaveBeenCalled();
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
