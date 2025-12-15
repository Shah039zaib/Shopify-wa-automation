/**
 * Keep-Alive Service
 * Prevents Render and other serverless platforms from sleeping
 */

const axios = require('axios');
const { logger } = require('../utils/logger');

let keepAliveInterval = null;

/**
 * Start the keep-alive service
 * Pings the server at regular intervals to prevent sleeping
 */
function startKeepAlive() {
  const interval = parseInt(process.env.KEEP_ALIVE_INTERVAL) || 840000; // Default: 14 minutes
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

  logger.info(`Keep-alive service starting with interval: ${interval / 1000}s`);

  keepAliveInterval = setInterval(async () => {
    try {
      const response = await axios.get(`${backendUrl}/health`, {
        timeout: 10000
      });

      logger.info(`Keep-alive ping successful: ${response.data.message}`);
    } catch (error) {
      logger.error('Keep-alive ping failed:', error.message);
    }
  }, interval);

  // Also ping immediately
  pingServer(backendUrl);

  logger.info('Keep-alive service started successfully');
}

/**
 * Ping the server
 */
async function pingServer(url) {
  try {
    const response = await axios.get(`${url}/health`, {
      timeout: 10000
    });
    logger.info(`Initial keep-alive ping: ${response.data.message}`);
  } catch (error) {
    logger.warn('Initial keep-alive ping failed:', error.message);
  }
}

/**
 * Stop the keep-alive service
 */
function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    logger.info('Keep-alive service stopped');
  }
}

/**
 * Check if keep-alive is running
 */
function isRunning() {
  return keepAliveInterval !== null;
}

module.exports = {
  startKeepAlive,
  stopKeepAlive,
  isRunning
};
