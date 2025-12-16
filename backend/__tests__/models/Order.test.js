/**
 * Order Model Tests
 */

jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));

const { query } = require('../../src/config/database');
const Order = require('../../src/models/Order');

describe('Order Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const mockOrder = {
        id: 'order-uuid-123',
        customer_id: 'customer-uuid-123',
        package_id: 'package-uuid-123',
        amount: 5000,
        status: 'pending',
        created_at: new Date()
      };

      query.mockResolvedValueOnce({ rows: [mockOrder] });

      const result = await Order.create({
        customer_id: 'customer-uuid-123',
        package_id: 'package-uuid-123',
        amount: 5000
      });

      expect(result).toEqual(mockOrder);
      expect(result.status).toBe('pending');
      expect(query).toHaveBeenCalledTimes(1);
    });

    it('should create order with default pending status', async () => {
      const mockOrder = {
        id: 'order-uuid-123',
        status: 'pending'
      };

      query.mockResolvedValueOnce({ rows: [mockOrder] });

      const result = await Order.create({
        customer_id: 'customer-uuid-123',
        package_id: 'package-uuid-123',
        amount: 3000
      });

      expect(result.status).toBe('pending');
    });
  });

  describe('findById', () => {
    it('should find order by ID', async () => {
      const mockOrder = {
        id: 'order-uuid-123',
        customer_id: 'customer-uuid-123',
        amount: 5000
      };

      query.mockResolvedValueOnce({ rows: [mockOrder] });

      const result = await Order.findById('order-uuid-123');

      expect(result).toEqual(mockOrder);
    });

    it('should return undefined for non-existent order', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const result = await Order.findById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const updatedOrder = {
        id: 'order-uuid-123',
        status: 'paid'
      };

      query.mockResolvedValueOnce({ rows: [updatedOrder] });

      const result = await Order.updateStatus('order-uuid-123', 'paid');

      expect(result.status).toBe('paid');
    });

    it('should update to payment_pending status', async () => {
      const updatedOrder = {
        id: 'order-uuid-123',
        status: 'payment_pending'
      };

      query.mockResolvedValueOnce({ rows: [updatedOrder] });

      const result = await Order.updateStatus('order-uuid-123', 'payment_pending');

      expect(result.status).toBe('payment_pending');
    });
  });

  describe('getByCustomer', () => {
    it('should get all orders for a customer', async () => {
      const mockOrders = [
        { id: 'order-1', amount: 3000, status: 'completed' },
        { id: 'order-2', amount: 5000, status: 'pending' }
      ];

      query.mockResolvedValueOnce({ rows: mockOrders });

      const result = await Order.getByCustomer('customer-uuid-123');

      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(3000);
    });

    it('should return empty array for customer with no orders', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const result = await Order.getByCustomer('new-customer');

      expect(result).toEqual([]);
    });
  });

  describe('updatePaymentScreenshot', () => {
    it('should update payment screenshot URL', async () => {
      const updatedOrder = {
        id: 'order-uuid-123',
        payment_screenshot: 'https://example.com/screenshot.jpg'
      };

      query.mockResolvedValueOnce({ rows: [updatedOrder] });

      const result = await Order.updatePaymentScreenshot(
        'order-uuid-123',
        'https://example.com/screenshot.jpg'
      );

      expect(result.payment_screenshot).toBe('https://example.com/screenshot.jpg');
    });
  });

  describe('getRevenueStats', () => {
    it('should return revenue statistics', async () => {
      const mockStats = {
        total_revenue: 50000,
        total_orders: 15,
        average_order_value: 3333
      };

      query.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await Order.getRevenueStats();

      expect(result.total_revenue).toBe(50000);
      expect(result.total_orders).toBe(15);
    });
  });

  describe('getRecent', () => {
    it('should return recent orders', async () => {
      const mockOrders = [
        { id: 'order-1', created_at: new Date() },
        { id: 'order-2', created_at: new Date() }
      ];

      query.mockResolvedValueOnce({ rows: mockOrders });

      const result = await Order.getRecent(10);

      expect(result).toHaveLength(2);
    });
  });

  describe('delete', () => {
    it('should delete an order', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      await Order.delete('order-uuid-123');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
        ['order-uuid-123']
      );
    });
  });
});
