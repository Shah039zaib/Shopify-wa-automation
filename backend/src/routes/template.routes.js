/**
 * Template Routes
 * Message template management
 */

const express = require('express');
const router = express.Router();
const templateController = require('../controllers/template.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody, validateParams, validateQuery } = require('../middleware/validate.middleware');

/**
 * GET /api/templates
 * Get all templates
 */
router.get(
  '/',
  requireAuth,
  validateQuery({
    category: { type: 'string' },
    language: { type: 'string' }
  }),
  templateController.getTemplates
);

/**
 * GET /api/templates/:id
 * Get single template
 */
router.get(
  '/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  templateController.getTemplate
);

/**
 * POST /api/templates
 * Create new template
 */
router.post(
  '/',
  requireAuth,
  validateBody({
    name: { required: true },
    content: { required: true },
    variables: { required: false, type: 'array' },
    language: { required: false },
    category: { required: false }
  }),
  templateController.createTemplate
);

/**
 * PUT /api/templates/:id
 * Update template
 */
router.put(
  '/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  templateController.updateTemplate
);

/**
 * DELETE /api/templates/:id
 * Delete template
 */
router.delete(
  '/:id',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  templateController.deleteTemplate
);

/**
 * POST /api/templates/:id/render
 * Render template with variables
 */
router.post(
  '/:id/render',
  requireAuth,
  validateParams({ id: { required: true, uuid: true } }),
  validateBody({
    variables: { required: true, type: 'object' }
  }),
  templateController.renderTemplate
);

module.exports = router;
