/**
 * Cloudinary Configuration
 * Media storage for payment screenshots, QR codes, etc.
 */

const cloudinary = require('cloudinary').v2;
const { logger } = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Cloudinary folders structure
 */
const folders = {
  paymentScreenshots: 'whatsapp-automation/payments',
  qrCodes: 'whatsapp-automation/qr-codes',
  customerMedia: 'whatsapp-automation/customer-media',
  temp: 'whatsapp-automation/temp'
};

/**
 * Upload options presets
 */
const uploadPresets = {
  // Payment screenshots
  payment: {
    folder: folders.paymentScreenshots,
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto' }
    ]
  },

  // QR codes
  qrCode: {
    folder: folders.qrCodes,
    resource_type: 'image',
    allowed_formats: ['png', 'jpg', 'jpeg'],
    transformation: [
      { width: 500, height: 500, crop: 'limit' }
    ]
  },

  // Customer media
  customerMedia: {
    folder: folders.customerMedia,
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'mp4', 'webm'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
};

/**
 * Test Cloudinary connection
 */
async function testConnection() {
  try {
    const result = await cloudinary.api.ping();
    logger.info('✅ Cloudinary connection successful');
    return true;
  } catch (error) {
    logger.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
}

module.exports = {
  cloudinary,
  folders,
  uploadPresets,
  testConnection
};
