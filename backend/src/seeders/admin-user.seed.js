/**
 * Admin User Seeder
 * Creates default admin user
 */

const User = require('../models/User');
const { logger } = require('../utils/logger');

async function seedAdminUser() {
  try {
    logger.info('🔐 Seeding admin user...');

    // Check if admin already exists
    const existingAdmin = await User.findByEmail(
      process.env.ADMIN_EMAIL || 'admin@example.com'
    );

    if (existingAdmin) {
      logger.info('⏭️  Admin user already exists, skipping...');
      return;
    }

    // Create admin user
    const adminData = {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: process.env.ADMIN_NAME || 'Admin User',
      role: 'admin'
    };

    await User.create(adminData);

    logger.info('✅ Admin user created successfully');
    logger.info(`   Email: ${adminData.email}`);
    logger.info(`   Password: ${adminData.password}`);
    logger.warn('⚠️  IMPORTANT: Change the default password after first login!');

  } catch (error) {
    logger.error('❌ Failed to seed admin user:', error);
    throw error;
  }
}

module.exports = seedAdminUser;
