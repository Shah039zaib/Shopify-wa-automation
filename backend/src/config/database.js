/**
 * Database Configuration - Neon PostgreSQL
 * Handles database connection and query execution
 */

const { Pool } = require('pg');
const { logger } = require('../utils/logger');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  },
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection fails
});

/**
 * Connect to database and verify connection
 */
async function connectDatabase() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    logger.info(`Database connected at: ${result.rows[0].now}`);
    client.release();
    return true;
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {array} params - Query parameters
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error:', { text, error: error.message });
    throw error;
  }
}

/**
 * Get a client from the pool (for transactions)
 */
async function getClient() {
  try {
    const client = await pool.connect();
    const _query = client.query.bind(client); // eslint-disable-line no-unused-vars
    const release = client.release.bind(client);

    // Set a timeout for client checkout
    const timeout = setTimeout(() => {
      logger.error('Client checkout timeout');
      client.release();
    }, 5000);

    // Monkey patch the release method to clear the timeout
    client.release = () => {
      clearTimeout(timeout);
      client.release = release;
      return release();
    };

    return client;
  } catch (error) {
    logger.error('Error getting client:', error);
    throw error;
  }
}

/**
 * Close all database connections
 */
async function closeDatabase() {
  try {
    await pool.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database:', error);
    throw error;
  }
}

/**
 * Transaction helper
 * @param {function} callback - Function to execute in transaction
 */
async function transaction(callback) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  getClient,
  connectDatabase,
  closeDatabase,
  transaction
};
