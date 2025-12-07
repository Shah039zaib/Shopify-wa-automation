/**
 * Payment Controller
 * Payment method configuration management
 */

const PaymentMethod = require('../models/PaymentMethod');
const { cloudinary } = require('../config/cloudinary');
const { NotFoundError, BadRequestError } = require('../utils/error-handler');

/**
 * Get all payment methods
 * GET /api/payments/methods
 */
exports.getMethods = async (req, res, next) => {
  try {
    const methods = await PaymentMethod.getAll();

    res.json({
      success: true,
      data: methods
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active payment methods
 * GET /api/payments/methods/active
 */
exports.getActiveMethods = async (req, res, next) => {
  try {
    const methods = await PaymentMethod.getActive();

    res.json({
      success: true,
      data: methods
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single payment method
 * GET /api/payments/methods/:id
 */
exports.getMethod = async (req, res, next) => {
  try {
    const { id } = req.params;

    const method = await PaymentMethod.findById(id);
    if (!method) {
      throw new NotFoundError('Payment method not found');
    }

    res.json({
      success: true,
      data: method
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create payment method
 * POST /api/payments/methods
 */
exports.createMethod = async (req, res, next) => {
  try {
    const { type, account_title, account_number, iban, bank_name } = req.body;

    const method = await PaymentMethod.create({
      type,
      account_title,
      account_number,
      iban,
      bank_name
    });

    res.status(201).json({
      success: true,
      message: 'Payment method created successfully',
      data: method
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update payment method
 * PUT /api/payments/methods/:id
 */
exports.updateMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const method = await PaymentMethod.findById(id);
    if (!method) {
      throw new NotFoundError('Payment method not found');
    }

    const updated = await PaymentMethod.update(id, updates);

    res.json({
      success: true,
      message: 'Payment method updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete payment method
 * DELETE /api/payments/methods/:id
 */
exports.deleteMethod = async (req, res, next) => {
  try {
    const { id } = req.params;

    const method = await PaymentMethod.findById(id);
    if (!method) {
      throw new NotFoundError('Payment method not found');
    }

    await PaymentMethod.delete(id);

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle payment method active status
 * POST /api/payments/methods/:id/toggle
 */
exports.toggleMethod = async (req, res, next) => {
  try {
    const { id } = req.params;

    const method = await PaymentMethod.findById(id);
    if (!method) {
      throw new NotFoundError('Payment method not found');
    }

    const updated = await PaymentMethod.toggleActive(id);

    res.json({
      success: true,
      message: `Payment method ${updated.is_active ? 'activated' : 'deactivated'}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload QR code for payment method
 * POST /api/payments/methods/:id/qr-code
 */
exports.uploadQRCode = async (req, res, next) => {
  try {
    const { id } = req.params;

    const method = await PaymentMethod.findById(id);
    if (!method) {
      throw new NotFoundError('Payment method not found');
    }

    if (!req.file) {
      throw new BadRequestError('QR code image is required');
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'whatsapp-automation/qr-codes',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Update payment method
    const updated = await PaymentMethod.updateQRCode(id, uploadResult.secure_url);

    res.json({
      success: true,
      message: 'QR code uploaded successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder payment methods
 * POST /api/payments/methods/reorder
 */
exports.reorderMethods = async (req, res, next) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order)) {
      throw new BadRequestError('Order must be an array');
    }

    await PaymentMethod.reorder(order);

    res.json({
      success: true,
      message: 'Payment methods reordered successfully'
    });
  } catch (error) {
    next(error);
  }
};
