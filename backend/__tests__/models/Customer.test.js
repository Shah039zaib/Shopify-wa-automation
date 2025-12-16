/**
 * Customer Model Tests
 */

// Mock the database
jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));

const { query } = require('../../src/config/database');
const Customer = require('../../src/models/Customer');

describe('Customer Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new customer with valid data', async () => {
      const mockCustomer = {
        id: 'uuid-123',
        phone_number: '03001234567',
        name: 'Ali Khan',
        language_preference: 'urdu',
        created_at: new Date()
      };

      query.mockResolvedValueOnce({ rows: [mockCustomer] });

      const result = await Customer.create({
        phone_number: '03001234567',
        name: 'Ali Khan',
        language_preference: 'urdu'
      });

      expect(result).toEqual(mockCustomer);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query.mock.calls[0][1]).toContain('03001234567');
    });

    it('should create customer with default language as urdu', async () => {
      const mockCustomer = {
        id: 'uuid-123',
        phone_number: '03001234567',
        language_preference: 'urdu'
      };

      query.mockResolvedValueOnce({ rows: [mockCustomer] });

      const result = await Customer.create({
        phone_number: '03001234567'
      });

      expect(result.language_preference).toBe('urdu');
    });
  });

  describe('findById', () => {
    it('should find customer by ID', async () => {
      const mockCustomer = {
        id: 'uuid-123',
        phone_number: '03001234567',
        name: 'Ali Khan'
      };

      query.mockResolvedValueOnce({ rows: [mockCustomer] });

      const result = await Customer.findById('uuid-123');

      expect(result).toEqual(mockCustomer);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['uuid-123']
      );
    });

    it('should return undefined for non-existent customer', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const result = await Customer.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findByPhone', () => {
    it('should find customer by phone number', async () => {
      const mockCustomer = {
        id: 'uuid-123',
        phone_number: '03001234567'
      };

      query.mockResolvedValueOnce({ rows: [mockCustomer] });

      const result = await Customer.findByPhone('03001234567');

      expect(result).toEqual(mockCustomer);
    });

    it('should return undefined for non-existent phone', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const result = await Customer.findByPhone('00000000000');

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update customer data', async () => {
      const updatedCustomer = {
        id: 'uuid-123',
        name: 'Ali Khan Updated',
        language_preference: 'english'
      };

      query.mockResolvedValueOnce({ rows: [updatedCustomer] });

      const result = await Customer.update('uuid-123', {
        name: 'Ali Khan Updated',
        language_preference: 'english'
      });

      expect(result).toEqual(updatedCustomer);
    });
  });

  describe('incrementOrderStats', () => {
    it('should increment order count and total spent', async () => {
      const updatedCustomer = {
        id: 'uuid-123',
        total_orders: 5,
        total_spent: 5000
      };

      query.mockResolvedValueOnce({ rows: [updatedCustomer] });

      const result = await Customer.incrementOrderStats('uuid-123', 1000);

      expect(result.total_orders).toBe(5);
      expect(result.total_spent).toBe(5000);
    });
  });

  describe('getAll', () => {
    it('should return paginated customers', async () => {
      const mockCustomers = [
        { id: 'uuid-1', name: 'Customer 1' },
        { id: 'uuid-2', name: 'Customer 2' }
      ];

      // Mock count query
      query.mockResolvedValueOnce({ rows: [{ count: '10' }] });
      // Mock data query
      query.mockResolvedValueOnce({ rows: mockCustomers });

      const result = await Customer.getAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockCustomers);
      expect(result.pagination).toBeDefined();
    });
  });

  describe('search', () => {
    it('should search customers by name or phone', async () => {
      const mockCustomers = [
        { id: 'uuid-1', name: 'Ali Khan', phone_number: '03001234567' }
      ];

      query.mockResolvedValueOnce({ rows: mockCustomers });

      const result = await Customer.search('Ali');

      expect(result).toEqual(mockCustomers);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.arrayContaining(['%Ali%'])
      );
    });
  });
});
