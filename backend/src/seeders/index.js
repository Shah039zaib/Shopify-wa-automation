/**
 * Database Seeder Runner
 * Populates database with initial/default data
 */

const { logger } = require('../utils/logger');
const adminUserSeed = require('./admin-user.seed');
const packagesSeed = require('./packages.seed');
const templatesSeed = require('./templates.seed');
const settingsSeed = require('./settings.seed');

/**
 * Run all seeders
 */
async function runSeeders() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Run seeders in order
    await adminUserSeed();
    await packagesSeed();
    await templatesSeed();
    await settingsSeed();

    logger.info('✅ All seeders completed successfully!');
    return true;

  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    throw error;
  }
}

module.exports = {
  runSeeders
};

// Run seeders if called directly
if (require.main === module) {
  runSeeders()
    .then(() => {
      logger.info('Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding process failed:', error);
      process.exit(1);
    });
}
