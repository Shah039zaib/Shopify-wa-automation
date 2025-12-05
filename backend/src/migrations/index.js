/**
 * Database Migration Runner
 * Automatically runs all SQL migration files in order
 */

const fs = require('fs');
const path = require('path');
const { query, pool } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Run all migrations
 */
async function runMigrations() {
  try {
    logger.info('Starting database migrations...');

    // Get all SQL migration files
    const migrationFiles = [
      '001_init_schema.sql',
      '002_users.sql',
      '003_customers.sql',
      '004_conversations.sql',
      '005_messages.sql',
      '006_whatsapp.sql',
      '007_ai_system.sql',
      '008_payments.sql',
      '009_orders.sql',
      '010_analytics.sql',
      '011_indexes.sql'
    ];

    // Create migrations tracking table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Check which migrations have already been run
    const executedResult = await query('SELECT filename FROM migrations');
    const executedMigrations = executedResult.rows.map(row => row.filename);

    // Run pending migrations
    for (const filename of migrationFiles) {
      if (executedMigrations.includes(filename)) {
        logger.info(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }

      logger.info(`🔄 Running migration: ${filename}`);

      // Read SQL file
      const filePath = path.join(__dirname, filename);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute migration
      await query(sql);

      // Record migration
      await query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [filename]
      );

      logger.info(`✅ Completed migration: ${filename}`);
    }

    logger.info('✅ All migrations completed successfully!');
    return true;

  } catch (error) {
    logger.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Rollback last migration (use with caution!)
 */
async function rollbackLastMigration() {
  try {
    logger.warn('⚠️  Rolling back last migration...');

    // Get last executed migration
    const result = await query(
      'SELECT filename FROM migrations ORDER BY executed_at DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }

    const lastMigration = result.rows[0].filename;
    logger.warn(`Rolling back: ${lastMigration}`);

    // Note: Actual rollback logic would need down migration files
    // For now, just remove from tracking
    await query('DELETE FROM migrations WHERE filename = $1', [lastMigration]);

    logger.info('✅ Rollback completed');

  } catch (error) {
    logger.error('❌ Rollback failed:', error);
    throw error;
  }
}

/**
 * Check migration status
 */
async function getMigrationStatus() {
  try {
    const result = await query(`
      SELECT filename, executed_at 
      FROM migrations 
      ORDER BY executed_at DESC
    `);

    return result.rows;
  } catch (error) {
    logger.error('Error getting migration status:', error);
    return [];
  }
}

module.exports = {
  runMigrations,
  rollbackLastMigration,
  getMigrationStatus
};

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration process failed:', error);
      process.exit(1);
    });
}
