/**
 * Packages Seeder
 * Creates default Shopify store packages
 */

const Package = require('../models/Package');
const { logger } = require('../utils/logger');

async function seedPackages() {
  try {
    logger.info('📦 Seeding packages...');

    // Check if packages already exist
    const existingPackages = await Package.getAll();
    
    if (existingPackages.length > 0) {
      logger.info('⏭️  Packages already exist, skipping...');
      return;
    }

    // Default packages
    const packages = [
      {
        name: 'Basic Store',
        description: 'Perfect for startups and small businesses',
        price: 5000.00,
        features: [
          '5-10 Products Setup',
          'Basic Theme Customization',
          'Payment Gateway Integration',
          'Contact Page Setup',
          'Mobile Responsive',
          '7 Days Support',
          'Basic SEO Setup'
        ],
        is_active: true,
        display_order: 1
      },
      {
        name: 'Standard Store',
        description: 'Ideal for growing businesses',
        price: 10000.00,
        features: [
          '20-30 Products Setup',
          'Premium Theme Customization',
          'Multiple Payment Gateways',
          'Social Media Integration',
          'Email Marketing Setup',
          'Advanced SEO Optimization',
          '15 Days Support',
          'Google Analytics Setup',
          'Logo Design Included'
        ],
        is_active: true,
        display_order: 2
      },
      {
        name: 'Premium Store',
        description: 'Complete solution for established businesses',
        price: 15000.00,
        features: [
          'Unlimited Products Setup',
          'Custom Theme Development',
          'Multiple Payment Methods',
          'Full Social Media Integration',
          'Email Marketing Automation',
          'Professional SEO Package',
          '30 Days Support',
          'Google Analytics + Facebook Pixel',
          'Custom Logo + Banner Design',
          'Multi-Currency Support',
          'Live Chat Integration',
          'Product Import/Export Tools',
          'Inventory Management Setup'
        ],
        is_active: true,
        display_order: 3
      }
    ];

    // Create packages
    for (const pkg of packages) {
      await Package.create(pkg);
      logger.info(`   ✓ Created package: ${pkg.name}`);
    }

    logger.info('✅ Packages seeded successfully');

  } catch (error) {
    logger.error('❌ Failed to seed packages:', error);
    throw error;
  }
}

module.exports = seedPackages;
