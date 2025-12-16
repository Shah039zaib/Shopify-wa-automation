/**
 * Customer Model Tests
 */

// Mock the database before requiring the model
jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123')
}));

const { query } = require('../../src/config/database');

describe('Customer Model', () => {
  let Customer;

  beforeAll(() => {
    Customer = require('../../src/models/Customer');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new customer with valid data', async () => {
      const mockCustomer = {
        id: 'mock-uuid-123',
        phone_number: '03001234567',
        name: 'Ali Khan',
        language_preference: 'urdu'
      };

      query.mockResolvedValueOnce({ rows: [mockCustomer] });

      const result = await Customer.create({
        phone_number: '03001234567',
        name: 'Ali Khan',
        language_preference: 'urdu'
      });

      expect(result).toEqual(mockCustomer);
      expect(query).toHaveBeenCalledTimes(1);
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
      expect(query).toHaveBeenCalled();
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

  describe('updateLastInteraction', () => {
    it('should update last interaction timestamp', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 'uuid-123' }] });

      await Customer.updateLastInteraction('uuid-123');

      expect(query).toHaveBeenCalled();
    });
  });
});
