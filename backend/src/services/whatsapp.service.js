/**
 * WhatsApp Service
 * Core WhatsApp functionality using whatsapp-web.js
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const WhatsAppAccount = require('../models/WhatsAppAccount');
const WhatsAppSession = require('../models/WhatsAppSession');
const { logger } = require('../utils/logger');
const whatsappConfig = require('../config/whatsapp');

// Store active clients
const activeClients = new Map();

/**
 * Initialize WhatsApp client for an account
 */
async function initializeClient(accountId, io) {
  try {
    logger.whatsapp(`Initializing WhatsApp client for account: ${accountId}`);

    // Check if client already exists
    if (activeClients.has(accountId)) {
      logger.whatsapp(`Client already exists for account: ${accountId}`);
      return activeClients.get(accountId);
    }

    // Create new client
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: accountId,
        dataPath: whatsappConfig.sessionPath
      }),
      puppeteer: whatsappConfig.puppeteer
    });

    // Setup event handlers
    setupEventHandlers(client, accountId, io);

    // Start client
    await client.initialize();

    // Store client
    activeClients.set(accountId, client);

    logger.whatsapp(`WhatsApp client initialized for account: ${accountId}`);
    return client;

  } catch (error) {
    logger.error(`Failed to initialize WhatsApp client for account ${accountId}:`, error);
    throw error;
  }
}

/**
 * Setup event handlers for WhatsApp client
 */
function setupEventHandlers(client, accountId, io) {
  // QR Code event
  client.on('qr', async (qr) => {
    logger.whatsapp(`QR Code received for account: ${accountId}`);

    try {
      // Generate QR code as data URL
      const qrDataURL = await qrcode.toDataURL(qr);

      // Save to database
      await WhatsAppSession.save({
        account_id: accountId,
        session_data: null,
        qr_code: qrDataURL
      });

      // Update account status
      await WhatsAppAccount.updateStatus(accountId, 'qr_received');

      // Emit to frontend
      if (io) {
        io.emit('whatsapp_qr', {
          accountId,
          qrCode: qrDataURL
        });
      }

      logger.whatsapp(`QR Code saved and emitted for account: ${accountId}`);
    } catch (error) {
      logger.error(`Error handling QR code for account ${accountId}:`, error);
    }
  });

  // Ready event
  client.on('ready', async () => {
    logger.whatsapp(`WhatsApp ready for account: ${accountId}`);

    try {
      // Get client info
      const info = client.info;

      // Update account
      await WhatsAppAccount.update(accountId, {
        phone_number: info.wid.user,
        status: 'ready'
      });

      // Save session
      await WhatsAppSession.save({
        account_id: accountId,
        session_data: { wid: info.wid },
        qr_code: null
      });

      // Emit to frontend
      if (io) {
        io.emit('whatsapp_ready', {
          accountId,
          phoneNumber: info.wid.user
        });
      }

      logger.whatsapp(`WhatsApp connected successfully for account: ${accountId}`);
    } catch (error) {
      logger.error(`Error handling ready event for account ${accountId}:`, error);
    }
  });

  // Message event
  client.on('message', async (message) => {
    try {
      // Handle incoming message
      const messageHandler = require('./message-handler.service');
      await messageHandler.processMessage(message, accountId, client);
    } catch (error) {
      logger.error(`Error processing message for account ${accountId}:`, error);
    }
  });

  // Authenticated event
  client.on('authenticated', async () => {
    logger.whatsapp(`Authenticated for account: ${accountId}`);

    await WhatsAppAccount.updateStatus(accountId, 'connected');
  });

  // Authentication failure event
  client.on('auth_failure', async (msg) => {
    logger.error(`Authentication failed for account ${accountId}:`, msg);

    await WhatsAppAccount.updateStatus(accountId, 'disconnected');

    // Delete session
    await WhatsAppSession.delete(accountId);

    if (io) {
      io.emit('whatsapp_auth_failure', { accountId });
    }
  });

  // Disconnected event
  client.on('disconnected', async (reason) => {
    logger.whatsapp(`Disconnected for account ${accountId}: ${reason}`);

    await WhatsAppAccount.updateStatus(accountId, 'disconnected');

    // Remove from active clients
    activeClients.delete(accountId);

    if (io) {
      io.emit('whatsapp_disconnected', { accountId, reason });
    }
  });
}

/**
 * Send message
 */
async function sendMessage(accountId, phoneNumber, message) {
  try {
    const client = activeClients.get(accountId);

    if (!client) {
      throw new Error('WhatsApp client not found');
    }

    // Format phone number for WhatsApp
    const { formatForWhatsApp } = require('../utils/phone-formatter');
    const chatId = `${formatForWhatsApp(phoneNumber)}@c.us`;

    // Send message
    await client.sendMessage(chatId, message);

    // Increment message count
    await WhatsAppAccount.incrementMessageCount(accountId);

    logger.whatsapp(`Message sent to ${phoneNumber} from account ${accountId}`);

    return true;
  } catch (error) {
    logger.error(`Failed to send message from account ${accountId}:`, error);
    throw error;
  }
}

/**
 * Send media
 */
async function sendMedia(accountId, phoneNumber, mediaUrl, caption = '') {
  try {
    const client = activeClients.get(accountId);

    if (!client) {
      throw new Error('WhatsApp client not found');
    }

    const { MessageMedia } = require('whatsapp-web.js');
    const { formatForWhatsApp } = require('../utils/phone-formatter');

    const chatId = `${formatForWhatsApp(phoneNumber)}@c.us`;

    // Download media
    const axios = require('axios');
    const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Get mime type
    const mimeType = response.headers['content-type'];
    const media = new MessageMedia(mimeType, buffer.toString('base64'));

    // Send media
    await client.sendMessage(chatId, media, { caption });

    await WhatsAppAccount.incrementMessageCount(accountId);

    logger.whatsapp(`Media sent to ${phoneNumber} from account ${accountId}`);

    return true;
  } catch (error) {
    logger.error(`Failed to send media from account ${accountId}:`, error);
    throw error;
  }
}

/**
 * Get client for account
 */
function getClient(accountId) {
  return activeClients.get(accountId);
}

/**
 * Disconnect client
 */
async function disconnectClient(accountId) {
  try {
    const client = activeClients.get(accountId);

    if (client) {
      await client.destroy();
      activeClients.delete(accountId);
      logger.whatsapp(`Client disconnected for account: ${accountId}`);
    }

    await WhatsAppAccount.updateStatus(accountId, 'disconnected');
    await WhatsAppSession.delete(accountId);

    return true;
  } catch (error) {
    logger.error(`Error disconnecting client for account ${accountId}:`, error);
    throw error;
  }
}

/**
 * Initialize all accounts on startup
 */
async function initializeWhatsApp(io) {
  try {
    logger.whatsapp('Initializing WhatsApp service...');

    // Get all active accounts
    const accounts = await WhatsAppAccount.getAll();

    for (const account of accounts) {
      try {
        await initializeClient(account.id, io);
      } catch (error) {
        logger.error(`Failed to initialize account ${account.id}:`, error);
      }
    }

    logger.whatsapp(`WhatsApp service initialized with ${accounts.length} accounts`);
  } catch (error) {
    logger.error('Failed to initialize WhatsApp service:', error);
    throw error;
  }
}

module.exports = {
  initializeClient,
  initializeWhatsApp,
  sendMessage,
  sendMedia,
  getClient,
  disconnectClient
};
