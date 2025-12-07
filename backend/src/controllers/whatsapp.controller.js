/**
 * WhatsApp Controller
 * WhatsApp account and connection management
 */

const WhatsAppAccount = require('../models/WhatsAppAccount');
const WhatsAppSession = require('../models/WhatsAppSession');
const SafetyLog = require('../models/SafetyLog');
const { NotFoundError, BadRequestError } = require('../utils/error-handler');

/**
 * Get all WhatsApp accounts
 * GET /api/whatsapp/accounts
 */
exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await WhatsAppAccount.getAll();

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single WhatsApp account
 * GET /api/whatsapp/accounts/:id
 */
exports.getAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const account = await WhatsAppAccount.findById(id);
    if (!account) {
      throw new NotFoundError('WhatsApp account not found');
    }

    // Get session info
    const session = await WhatsAppSession.getByAccountId(id);

    res.json({
      success: true,
      data: {
        ...account,
        hasSession: !!session,
        sessionActive: session ? await WhatsAppSession.isValid(id) : false
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add new WhatsApp account
 * POST /api/whatsapp/accounts
 */
exports.addAccount = async (req, res, next) => {
  try {
    const { phone_number, name, is_primary, daily_limit } = req.body;

    // Check if phone number already exists
    const existing = await WhatsAppAccount.findByPhone(phone_number);
    if (existing) {
      throw new BadRequestError('Phone number already registered');
    }

    const account = await WhatsAppAccount.create({
      phone_number,
      name,
      is_primary: is_primary || false,
      daily_limit: daily_limit || 500
    });

    res.status(201).json({
      success: true,
      message: 'WhatsApp account added successfully',
      data: account
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update WhatsApp account
 * PUT /api/whatsapp/accounts/:id
 */
exports.updateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const account = await WhatsAppAccount.findById(id);
    if (!account) {
      throw new NotFoundError('WhatsApp account not found');
    }

    const updated = await WhatsAppAccount.update(id, updates);

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete WhatsApp account
 * DELETE /api/whatsapp/accounts/:id
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const account = await WhatsAppAccount.findById(id);
    if (!account) {
      throw new NotFoundError('WhatsApp account not found');
    }

    await WhatsAppAccount.delete(id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get QR code for account
 * GET /api/whatsapp/qr/:accountId
 */
exports.getQRCode = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const session = await WhatsAppSession.getByAccountId(accountId);

    if (!session || !session.qr_code) {
      return res.json({
        success: true,
        data: {
          hasQR: false,
          message: 'No QR code available. Please initiate connection.'
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasQR: true,
        qrCode: session.qr_code
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get connection status
 * GET /api/whatsapp/status/:accountId
 */
exports.getStatus = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const account = await WhatsAppAccount.findById(accountId);
    if (!account) {
      throw new NotFoundError('WhatsApp account not found');
    }

    const session = await WhatsAppSession.getByAccountId(accountId);

    res.json({
      success: true,
      data: {
        status: account.status,
        hasSession: !!session,
        sessionValid: session ? await WhatsAppSession.isValid(accountId) : false,
        dailyMessageCount: account.daily_message_count,
        dailyLimit: account.daily_limit,
        riskLevel: account.risk_level
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disconnect account
 * POST /api/whatsapp/disconnect/:accountId
 */
exports.disconnect = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const account = await WhatsAppAccount.findById(accountId);
    if (!account) {
      throw new NotFoundError('WhatsApp account not found');
    }

    // Update status
    await WhatsAppAccount.updateStatus(accountId, 'disconnected');

    // Delete session
    await WhatsAppSession.delete(accountId);

    // Emit socket event
    if (global.io) {
      global.io.emit('whatsapp_disconnected', { accountId });
    }

    res.json({
      success: true,
      message: 'Account disconnected successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reconnect account
 * POST /api/whatsapp/reconnect/:accountId
 */
exports.reconnect = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const account = await WhatsAppAccount.findById(accountId);
    if (!account) {
      throw new NotFoundError('WhatsApp account not found');
    }

    // Update status to connecting
    await WhatsAppAccount.updateStatus(accountId, 'connecting');

    // Emit socket event to trigger reconnection
    if (global.io) {
      global.io.emit('whatsapp_reconnect', { accountId });
    }

    res.json({
      success: true,
      message: 'Reconnection initiated. Please scan QR code.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get safety statistics
 * GET /api/whatsapp/safety-stats/:accountId
 */
exports.getSafetyStats = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const [stats, riskInfo, recentLogs] = await Promise.all([
      SafetyLog.getAccountStats(accountId, 7),
      SafetyLog.calculateRiskLevel(accountId),
      SafetyLog.getByAccount(accountId, 10)
    ]);

    res.json({
      success: true,
      data: {
        stats,
        riskLevel: riskInfo.riskLevel,
        riskStats: riskInfo.stats,
        recentLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update WhatsApp settings
 * PUT /api/whatsapp/settings
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = req.body;

    // Update settings in database
    const Setting = require('../models/Setting');
    
    for (const [key, value] of Object.entries(settings)) {
      await Setting.update(key, value);
    }

    res.json({
      success: true,
      message: 'WhatsApp settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
