/**
 * Customer Controller
 * Customer management logic
 */

const Customer = require('../models/Customer');
const { NotFoundError, ConflictError } = require('../utils/error-handler');

/**
 * Get all customers with pagination
 * GET /api/customers
 */
exports.getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const result = await Customer.getAll({ 
      page: parseInt(page), 
      limit: parseInt(limit), 
      search 
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
 * Get single customer
 * GET /api/customers/:id
 */
exports.getCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new customer
 * POST /api/customers
 */
exports.createCustomer = async (req, res, next) => {
  try {
    const { phone_number, name, email, language_preference, tags } = req.body;

    // Check if customer already exists
    const existing = await Customer.findByPhone(phone_number);
    if (existing) {
      throw new ConflictError('Customer with this phone number already exists');
    }

    const customer = await Customer.create({
      phone_number,
      name,
      email,
      language_preference: language_preference || 'urdu',
      tags: tags || []
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update customer
 * PUT /api/customers/:id
 */
exports.updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // If phone number is being changed, check if it's unique
    if (updates.phone_number && updates.phone_number !== customer.phone_number) {
      const existing = await Customer.findByPhone(updates.phone_number);
      if (existing) {
        throw new ConflictError('Phone number already in use');
      }
    }

    const updated = await Customer.update(id, updates);

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete customer
 * DELETE /api/customers/:id
 */
exports.deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    await Customer.delete(id);

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer statistics
 * GET /api/customers/:id/stats
 */
exports.getCustomerStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const stats = await Customer.getStats(id);
    if (!stats) {
      throw new NotFoundError('Customer not found');
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search customers
 * GET /api/customers/search
 */
exports.searchCustomers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const customers = await Customer.search(q);

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};
