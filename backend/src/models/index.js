/**
 * Models Index
 * Exports all database models
 */

const User = require('./User');
const Customer = require('./Customer');
const Conversation = require('./Conversation');
const Message = require('./Message');
const WhatsAppAccount = require('./WhatsAppAccount');
const WhatsAppSession = require('./WhatsAppSession');
const AIProvider = require('./AIProvider');
const AIKey = require('./AIKey');
const AIPrompt = require('./AIPrompt');
const AILog = require('./AILog');
const PaymentMethod = require('./PaymentMethod');
const Order = require('./Order');
const Package = require('./Package');
const Template = require('./Template');
const Setting = require('./Setting');
const SafetyLog = require('./SafetyLog');
const ConversationAnalytics = require('./ConversationAnalytics');
const SalesAnalytics = require('./SalesAnalytics');
const AIAnalytics = require('./AIAnalytics');
const CustomerAnalytics = require('./CustomerAnalytics');

module.exports = {
  User,
  Customer,
  Conversation,
  Message,
  WhatsAppAccount,
  WhatsAppSession,
  AIProvider,
  AIKey,
  AIPrompt,
  AILog,
  PaymentMethod,
  Order,
  Package,
  Template,
  Setting,
  SafetyLog,
  ConversationAnalytics,
  SalesAnalytics,
  AIAnalytics,
  CustomerAnalytics
};
