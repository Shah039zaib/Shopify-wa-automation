/**
 * Order Model Tests
 */

// Mock the database before requiring the model
jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-order-uuid')
}));

const { query } = require('../../src/config/database');

describe('Order Model', () => {
  let Order;

  beforeAll(() => {
    Order = require('../../src/models/Order');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const mockOrder = {
        id: 'mock-order-uuid',
        customer_id: 'customer-uuid-123',
        package_id: 'package-uuid-123',
        amount: 5000,
        status: 'pending'
      };

      query.mockResolvedValueOnce({ rows: [mockOrder] });

      const result = await Order.create({
        customer_id: 'customer-uuid-123',
        package_id: 'package-uuid-123',
        amount: 5000
      });

      expect(result).toEqual(mockOrder);
      expect(query).toHaveBeenCalledTimes(1);
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
    });

    it('should return empty array for customer with no orders', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const result = await Order.getByCustomer('new-customer');

      expect(result).toEqual([]);
    });
  });
});
