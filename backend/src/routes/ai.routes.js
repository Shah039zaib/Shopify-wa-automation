/**
 * AI Routes
 * AI provider and configuration management
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody, validateParams, validateQuery } = require('../middleware/validate.middleware');

/**
 * GET /api/ai/providers
 * Get all AI providers
 */
router.get('/providers', requireAuth, aiController.getProviders);

/**
 * GET /api/ai/providers/:id
 * Get single AI provider
 */
router.get(
  '/providers/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  aiController.getProvider
);

/**
 * PUT /api/ai/providers/:id
 * Update AI provider settings
 */
router.put(
  '/providers/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  aiController.updateProvider
);

/**
 * POST /api/ai/providers/:id/test
 * Test AI provider connection
 */
router.post(
  '/providers/:id/test',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  validateBody({
    test_message: { required: true }
  }),
  aiController.testProvider
);

/**
 * GET /api/ai/keys
 * Get all AI keys (masked)
 */
router.get('/keys', requireAuth, aiController.getKeys);

/**
 * POST /api/ai/keys
 * Add new AI key
 */
router.post(
  '/keys',
  requireAuth,
  validateBody({
    provider_id: { required: true, uuid: true },
    api_key: { required: true },
    requests_limit: { required: false, type: 'number' }
  }),
  aiController.addKey
);

/**
 * DELETE /api/ai/keys/:id
 * Delete AI key
 */
router.delete(
  '/keys/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  aiController.deleteKey
);

/**
 * GET /api/ai/prompts
 * Get all AI prompts
 */
router.get(
  '/prompts',
  requireAuth,
  validateQuery({
    type: { type: 'string' },
    language: { type: 'string' }
  }),
  aiController.getPrompts
);

/**
 * GET /api/ai/prompts/:id
 * Get single prompt
 */
router.get(
  '/prompts/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  aiController.getPrompt
);

/**
 * POST /api/ai/prompts
 * Create new prompt
 */
router.post(
  '/prompts',
  requireAuth,
  validateBody({
    name: { required: true },
    type: { required: true, enum: ['welcome', 'sales', 'payment', 'followup', 'confirmation', 'support'] },
    content: { required: true },
    language: { required: false }
  }),
  aiController.createPrompt
);

/**
 * PUT /api/ai/prompts/:id
 * Update prompt
 */
router.put(
  '/prompts/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  aiController.updatePrompt
);

/**
 * DELETE /api/ai/prompts/:id
 * Delete prompt
 */
router.delete(
  '/prompts/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  aiController.deletePrompt
);

/**
 * GET /api/ai/logs
 * Get AI logs
 */
router.get(
  '/logs',
  requireAuth,
  validateQuery({
    page: { type: 'number' },
    limit: { type: 'number' },
    provider_id: { type: 'string' },
    success: { type: 'boolean' }
  }),
  aiController.getLogs
);

/**
 * GET /api/ai/analytics
 * Get AI performance analytics
 */
router.get('/analytics', requireAuth, aiController.getAnalytics);

module.exports = router;
