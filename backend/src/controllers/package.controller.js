/**
 * Package Controller
 * Service package management
 */

const Package = require('../models/Package');
const { NotFoundError, BadRequestError } = require('../utils/error-handler');

/**
 * Get all packages
 * GET /api/packages
 */
exports.getPackages = async (req, res, next) => {
  try {
    const packages = await Package.getAllWithStats();

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active packages only
 * GET /api/packages/active
 */
exports.getActivePackages = async (req, res, next) => {
  try {
    const packages = await Package.getActive();

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single package
 * GET /api/packages/:id
 */
exports.getPackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pkg = await Package.getWithStats(id);
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    res.json({
      success: true,
      data: pkg
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new package
 * POST /api/packages
 */
exports.createPackage = async (req, res, next) => {
  try {
    const { name, description, price, features } = req.body;

    const pkg = await Package.create({
      name,
      description,
      price,
      features
    });

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: pkg
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update package
 * PUT /api/packages/:id
 */
exports.updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const pkg = await Package.findById(id);
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    const updated = await Package.update(id, updates);

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete package
 * DELETE /api/packages/:id
 */
exports.deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findById(id);
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    await Package.delete(id);

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle package active status
 * POST /api/packages/:id/toggle
 */
exports.togglePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findById(id);
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }

    const updated = await Package.toggleActive(id);

    res.json({
      success: true,
      message: `Package ${updated.is_active ? 'activated' : 'deactivated'}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder packages
 * POST /api/packages/reorder
 */
exports.reorderPackages = async (req, res, next) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order)) {
      throw new BadRequestError('Order must be an array');
    }

    await Package.reorder(order);

    res.json({
      success: true,
      message: 'Packages reordered successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get package statistics
 * GET /api/packages/:id/stats
 */
exports.getPackageStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const stats = await Package.getWithStats(id);
    if (!stats) {
      throw new NotFoundError('Package not found');
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
