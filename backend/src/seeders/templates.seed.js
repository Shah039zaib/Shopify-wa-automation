/**
 * Templates Seeder
 * Creates default message templates
 */

const Template = require('../models/Template');
const { logger } = require('../utils/logger');

async function seedTemplates() {
  try {
    logger.info('💬 Seeding templates...');

    // Check if templates already exist
    const existingTemplates = await Template.getAll();
    
    if (existingTemplates.length > 0) {
      logger.info('⏭️  Templates already exist, skipping...');
      return;
    }

    // Default templates
    const templates = [
      // Welcome Messages
      {
        name: 'Welcome Message - Urdu',
        content: `Assalam o Alaikum! {{customer_name}} bhai!\n\n🎉 Aapka shukriya Shopify store services ke liye contact karne ka!\n\nMain aapki madad ke liye yahan hoon. Aap mujhe apni zarooriyaat bata sakte hain aur main aapko best package suggest karunga.\n\nKya aap apna Shopify store banana chahte hain? 🛍️`,
        variables: ['customer_name'],
        language: 'urdu',
        category: 'welcome'
      },
      {
        name: 'Welcome Message - English',
        content: `Hello {{customer_name}}!\n\n🎉 Thank you for contacting us about Shopify store services!\n\nI'm here to help you. Please tell me your requirements and I'll suggest the best package for you.\n\nWould you like to build your Shopify store? 🛍️`,
        variables: ['customer_name'],
        language: 'english',
        category: 'welcome'
      },

      // Package Information
      {
        name: 'Package Details - Urdu',
        content: `📦 Yeh hain humare packages:\n\n{{package_details}}\n\nKaunsa package aapko pasand aaya? Ya phir main aapki requirements sunke suggest kar sakta hoon! 😊`,
        variables: ['package_details'],
        language: 'urdu',
        category: 'sales'
      },

      // Payment Request
      {
        name: 'Payment Request - Urdu',
        content: `💰 Payment Details:\n\nPackage: {{package_name}}\nAmount: Rs. {{amount}}\n\n{{payment_methods}}\n\nPayment karne ke baad please screenshot zaroor bhejein! 📸`,
        variables: ['package_name', 'amount', 'payment_methods'],
        language: 'urdu',
        category: 'payment'
      },
      {
        name: 'Payment Request - English',
        content: `💰 Payment Details:\n\nPackage: {{package_name}}\nAmount: Rs. {{amount}}\n\n{{payment_methods}}\n\nPlease send screenshot after payment! 📸`,
        variables: ['package_name', 'amount', 'payment_methods'],
        language: 'english',
        category: 'payment'
      },

      // Payment Received
      {
        name: 'Payment Confirmation - Urdu',
        content: `✅ Shukriya {{customer_name}}!\n\nAapka payment mil gaya hai. Main verify karke aapko confirm kar deta hoon.\n\nAapka order jaldi hi start ho jayega! 🚀`,
        variables: ['customer_name'],
        language: 'urdu',
        category: 'confirmation'
      },

      // Order Confirmation
      {
        name: 'Order Confirmed - Urdu',
        content: `🎉 Congratulations {{customer_name}}!\n\nAapka order confirm ho gaya hai!\n\nOrder Details:\n📦 Package: {{package_name}}\n💰 Amount: Rs. {{amount}}\n⏰ Delivery: {{delivery_time}}\n\nHum jaldi shuru karenge. Agar koi sawal ho to zaroor puchein! 😊`,
        variables: ['customer_name', 'package_name', 'amount', 'delivery_time'],
        language: 'urdu',
        category: 'confirmation'
      },

      // Follow-up
      {
        name: 'Follow Up - Urdu',
        content: `Hi {{customer_name}}! 👋\n\nKya aapne Shopify store ke baare mein socha? Main aapki koi madad kar sakta hoon?\n\nAgar koi confusion hai to bataein, main clarify kar dunga! 😊`,
        variables: ['customer_name'],
        language: 'urdu',
        category: 'followup'
      },

      // Support
      {
        name: 'Support Message - Urdu',
        content: `🤝 Koi masla hai {{customer_name}}?\n\nMain yahan aapki madad ke liye hoon. Apna sawal puchein, main jaldi jawab dunga!\n\nAap mujhse kuch bhi puch sakte hain. 😊`,
        variables: ['customer_name'],
        language: 'urdu',
        category: 'support'
      }
    ];

    // Create templates
    for (const template of templates) {
      await Template.create(template);
      logger.info(`   ✓ Created template: ${template.name}`);
    }

    logger.info('✅ Templates seeded successfully');

  } catch (error) {
    logger.error('❌ Failed to seed templates:', error);
    throw error;
  }
}

module.exports = seedTemplates;
