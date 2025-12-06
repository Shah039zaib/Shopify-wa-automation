/**
 * Settings Seeder
 * Creates default system settings
 */

const Setting = require('../models/Setting');
const { logger } = require('../utils/logger');

async function seedSettings() {
  try {
    logger.info('⚙️  Seeding settings...');

    // Default settings
    const settings = [
      // General Settings
      {
        key: 'app_name',
        value: 'WhatsApp Automation',
        type: 'string',
        category: 'general',
        description: 'Application name'
      },
      {
        key: 'app_version',
        value: '1.0.0',
        type: 'string',
        category: 'general',
        description: 'Application version'
      },
      {
        key: 'default_language',
        value: 'urdu',
        type: 'string',
        category: 'general',
        description: 'Default language for responses'
      },

      // WhatsApp Settings
      {
        key: 'max_messages_per_minute',
        value: process.env.MAX_MESSAGES_PER_MINUTE || '20',
        type: 'number',
        category: 'whatsapp',
        description: 'Maximum messages per minute (anti-ban)'
      },
      {
        key: 'max_messages_per_hour',
        value: process.env.MAX_MESSAGES_PER_HOUR || '100',
        type: 'number',
        category: 'whatsapp',
        description: 'Maximum messages per hour (anti-ban)'
      },
      {
        key: 'max_messages_per_day',
        value: process.env.MAX_MESSAGES_PER_DAY || '500',
        type: 'number',
        category: 'whatsapp',
        description: 'Maximum messages per day (anti-ban)'
      },
      {
        key: 'message_delay_min',
        value: process.env.MESSAGE_DELAY_MIN || '2000',
        type: 'number',
        category: 'whatsapp',
        description: 'Minimum delay between messages (ms)'
      },
      {
        key: 'message_delay_max',
        value: process.env.MESSAGE_DELAY_MAX || '5000',
        type: 'number',
        category: 'whatsapp',
        description: 'Maximum delay between messages (ms)'
      },

      // Business Hours
      {
        key: 'business_hours_enabled',
        value: 'false',
        type: 'boolean',
        category: 'general',
        description: 'Enable business hours restriction'
      },
      {
        key: 'business_hours_start',
        value: '09:00',
        type: 'string',
        category: 'general',
        description: 'Business hours start time (HH:mm)'
      },
      {
        key: 'business_hours_end',
        value: '18:00',
        type: 'string',
        category: 'general',
        description: 'Business hours end time (HH:mm)'
      },

      // AI Settings
      {
        key: 'enable_ai',
        value: 'true',
        type: 'boolean',
        category: 'ai',
        description: 'Enable AI-powered responses'
      },
      {
        key: 'ai_temperature',
        value: '0.7',
        type: 'number',
        category: 'ai',
        description: 'AI creativity/temperature setting (0-1)'
      },
      {
        key: 'ai_max_tokens',
        value: '1024',
        type: 'number',
        category: 'ai',
        description: 'Maximum tokens per AI response'
      },
      {
        key: 'enable_ai_rotation',
        value: 'true',
        type: 'boolean',
        category: 'ai',
        description: 'Enable automatic AI provider rotation'
      },

      // Security Settings
      {
        key: 'session_timeout',
        value: '7200',
        type: 'number',
        category: 'security',
        description: 'Session timeout in seconds (2 hours)'
      },
      {
        key: 'max_login_attempts',
        value: '5',
        type: 'number',
        category: 'security',
        description: 'Maximum failed login attempts'
      },

      // Notification Settings
      {
        key: 'enable_email_notifications',
        value: 'false',
        type: 'boolean',
        category: 'notification',
        description: 'Enable email notifications'
      },
      {
        key: 'admin_notification_email',
        value: process.env.ADMIN_EMAIL || 'admin@example.com',
        type: 'string',
        category: 'notification',
        description: 'Admin email for notifications'
      },
      {
        key: 'notify_on_new_order',
        value: 'true',
        type: 'boolean',
        category: 'notification',
        description: 'Notify admin on new orders'
      },
      {
        key: 'notify_on_payment',
        value: 'true',
        type: 'boolean',
        category: 'notification',
        description: 'Notify admin on payment received'
      },

      // Payment Settings
      {
        key: 'currency',
        value: 'PKR',
        type: 'string',
        category: 'payment',
        description: 'Default currency'
      },
      {
        key: 'currency_symbol',
        value: 'Rs.',
        type: 'string',
        category: 'payment',
        description: 'Currency symbol'
      },

      // Analytics Settings
      {
        key: 'enable_analytics',
        value: 'true',
        type: 'boolean',
        category: 'general',
        description: 'Enable analytics tracking'
      },
      {
        key: 'analytics_retention_days',
        value: '90',
        type: 'number',
        category: 'general',
        description: 'Days to retain analytics data'
      }
    ];

    // Create settings
    for (const setting of settings) {
      try {
        await Setting.set(
          setting.key,
          setting.value,
          setting.type,
          setting.category,
          setting.description
        );
        logger.info(`   ✓ Created setting: ${setting.key}`);
      } catch (error) {
        // If setting already exists, skip
        if (error.message && error.message.includes('duplicate')) {
          logger.info(`   ⏭️  Setting already exists: ${setting.key}`);
        } else {
          throw error;
        }
      }
    }

    logger.info('✅ Settings seeded successfully');

  } catch (error) {
    logger.error('❌ Failed to seed settings:', error);
    throw error;
  }
}

module.exports = seedSettings;
