/**
 * Job Scheduler
 * Handles cron jobs and scheduled tasks
 */

const cron = require('node-cron');
const { logger } = require('../utils/logger');

// Store scheduled jobs
const scheduledJobs = new Map();

/**
 * Start all scheduled jobs
 */
function startScheduler() {
  logger.info('Starting job scheduler...');

  // Job 1: Clean old sessions (runs daily at 2 AM)
  scheduleJob('cleanSessions', '0 2 * * *', cleanOldSessions);

  // Job 2: Update analytics (runs every hour)
  scheduleJob('updateAnalytics', '0 * * * *', updateAnalytics);

  // Job 3: Check WhatsApp connection status (runs every 5 minutes)
  scheduleJob('checkWhatsAppStatus', '*/5 * * * *', checkWhatsAppStatus);

  // Job 4: Send follow-up messages (runs every day at 10 AM)
  scheduleJob('sendFollowUps', '0 10 * * *', sendFollowUpMessages);

  // Job 5: Clean old logs (runs weekly on Sunday at 3 AM)
  scheduleJob('cleanLogs', '0 3 * * 0', cleanOldLogs);

  // Job 6: Backup database (runs daily at 1 AM)
  scheduleJob('backupDb', '0 1 * * *', backupDatabase);

  logger.info(`Job scheduler started with ${scheduledJobs.size} jobs`);
}

/**
 * Schedule a job
 */
function scheduleJob(name, cronExpression, handler) {
  try {
    const job = cron.schedule(cronExpression, async () => {
      logger.info(`Running scheduled job: ${name}`);
      try {
        await handler();
        logger.info(`Job ${name} completed successfully`);
      } catch (error) {
        logger.error(`Job ${name} failed:`, error);
      }
    }, {
      scheduled: true,
      timezone: process.env.TIMEZONE || 'Asia/Karachi'
    });

    scheduledJobs.set(name, job);
    logger.info(`Scheduled job: ${name} (${cronExpression})`);
  } catch (error) {
    logger.error(`Failed to schedule job ${name}:`, error);
  }
}

/**
 * Clean old WhatsApp sessions
 */
async function cleanOldSessions() {
  try {
    const WhatsAppSession = require('../models/WhatsAppSession');
    const deleted = await WhatsAppSession.deleteExpired();
    logger.info(`Cleaned ${deleted} expired sessions`);
  } catch (error) {
    logger.error('Failed to clean old sessions:', error);
  }
}

/**
 * Update analytics data
 */
async function updateAnalytics() {
  try {
    const SalesAnalytics = require('../models/SalesAnalytics');
    const ConversationAnalytics = require('../models/ConversationAnalytics');
    const CustomerAnalytics = require('../models/CustomerAnalytics');

    // Fetch and cache analytics data for dashboard
    // These are read-only operations - data is calculated on the fly
    await SalesAnalytics.getOverallStats();
    await ConversationAnalytics.getOverallStats();
    await CustomerAnalytics.getOverallStats();

    logger.info('Analytics cache refreshed successfully');
  } catch (error) {
    logger.error('Failed to update analytics:', error);
  }
}

/**
 * Check WhatsApp connection status
 */
async function checkWhatsAppStatus() {
  try {
    const WhatsAppAccount = require('../models/WhatsAppAccount');
    const whatsappService = require('../services/whatsapp.service');

    const accounts = await WhatsAppAccount.getAll();

    for (const account of accounts) {
      const client = whatsappService.getClient(account.id);

      if (!client && account.status === 'ready') {
        // Client should be connected but isn't
        await WhatsAppAccount.updateStatus(account.id, 'disconnected');
        logger.warn(`Account ${account.id} marked as disconnected`);
      }
    }
  } catch (error) {
    logger.error('Failed to check WhatsApp status:', error);
  }
}

/**
 * Send follow-up messages to inactive conversations
 */
async function sendFollowUpMessages() {
  try {
    const Conversation = require('../models/Conversation');
    const Customer = require('../models/Customer');
    const Template = require('../models/Template');
    const whatsappService = require('../services/whatsapp.service');

    // Get conversations inactive for 24+ hours
    const inactiveResult = await Conversation.getAll({ status: 'active' });
    const now = new Date();
    const inactiveConversations = inactiveResult.data.filter(conv => {
      if (!conv.last_message_at) return false;
      const lastMsg = new Date(conv.last_message_at);
      const hoursDiff = (now - lastMsg) / (1000 * 60 * 60);
      return hoursDiff >= 24 && !conv.follow_up_sent;
    });

    for (const conv of inactiveConversations) {
      try {
        const customer = await Customer.findById(conv.customer_id);
        const templates = await Template.getByCategory('follow_up');
        const template = templates[0]; // Get first follow-up template

        if (customer && template) {
          await whatsappService.sendMessage(
            conv.whatsapp_account_id,
            customer.phone_number,
            template.content
          );

          // Mark follow-up sent
          await Conversation.update(conv.id, { follow_up_sent: true });
        }
      } catch (err) {
        logger.error(`Failed to send follow-up for conversation ${conv.id}:`, err);
      }
    }

    logger.info(`Processed ${inactiveConversations.length} follow-ups`);
  } catch (error) {
    logger.error('Failed to send follow-up messages:', error);
  }
}

/**
 * Clean old log entries
 */
async function cleanOldLogs() {
  try {
    const AILog = require('../models/AILog');
    const SafetyLog = require('../models/SafetyLog');

    // Delete logs older than 90 days
    const aiDeleted = await AILog.deleteOlderThan(90);
    const safetyDeleted = await SafetyLog.deleteOlderThan(90);

    logger.info(`Cleaned ${aiDeleted} AI logs and ${safetyDeleted} safety logs`);
  } catch (error) {
    logger.error('Failed to clean old logs:', error);
  }
}

/**
 * Backup database
 */
async function backupDatabase() {
  try {
    // This is a placeholder - implement actual backup logic
    // You might use pg_dump for PostgreSQL or similar
    logger.info('Database backup job - implement based on your hosting');

    // Example: You could call an external backup service
    // or trigger a database snapshot on Neon
  } catch (error) {
    logger.error('Failed to backup database:', error);
  }
}

/**
 * Stop all scheduled jobs
 */
function stopScheduler() {
  scheduledJobs.forEach((job, name) => {
    job.stop();
    logger.info(`Stopped job: ${name}`);
  });
  scheduledJobs.clear();
  logger.info('Job scheduler stopped');
}

/**
 * Get all scheduled jobs
 */
function getScheduledJobs() {
  const jobs = [];
  scheduledJobs.forEach((job, name) => {
    jobs.push({
      name,
      running: job.running || false
    });
  });
  return jobs;
}

/**
 * Run a specific job manually
 */
async function runJob(jobName) {
  const jobHandlers = {
    cleanSessions: cleanOldSessions,
    updateAnalytics: updateAnalytics,
    checkWhatsAppStatus: checkWhatsAppStatus,
    sendFollowUps: sendFollowUpMessages,
    cleanLogs: cleanOldLogs,
    backupDb: backupDatabase
  };

  const handler = jobHandlers[jobName];
  if (handler) {
    await handler();
    return true;
  }
  return false;
}

module.exports = {
  startScheduler,
  stopScheduler,
  getScheduledJobs,
  runJob,
  scheduleJob
};
