/**
 * Settings Controller
 * System settings management
 */

const Setting = require('../models/Setting');
const { NotFoundError, BadRequestError } = require('../utils/error-handler');

/**
 * Get all settings
 * GET /api/settings
 */
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.getAll();

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get settings by category
 * GET /api/settings/category/:category
 */
exports.getSettingsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const settings = await Setting.getByCategory(category);

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single setting
 * GET /api/settings/:key
 */
exports.getSetting = async (req, res, next) => {
  try {
    const { key } = req.params;

    const value = await Setting.get(key);

    if (value === null) {
      throw new NotFoundError('Setting not found');
    }

    res.json({
      success: true,
      data: {
        key,
        value
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update single setting
 * PUT /api/settings/:key
 */
exports.updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const exists = await Setting.exists(key);
    if (!exists) {
      throw new NotFoundError('Setting not found');
    }

    await Setting.update(key, value);

    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: {
        key,
        value
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update settings
 * POST /api/settings/bulk-update
 */
exports.bulkUpdateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
      throw new BadRequestError('Settings must be an array');
    }

    await Setting.bulkUpdate(settings);

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset settings to defaults
 * POST /api/settings/reset
 */
exports.resetSettings = async (req, res, next) => {
  try {
    await Setting.resetToDefaults();

    res.json({
      success: true,
      message: 'Settings reset to defaults successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all setting categories
 * GET /api/settings/meta/categories
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Setting.getCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
