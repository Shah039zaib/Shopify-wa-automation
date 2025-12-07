/**
 * Template Controller
 * Message template management
 */

const Template = require('../models/Template');
const { NotFoundError } = require('../utils/error-handler');

/**
 * Get all templates
 * GET /api/templates
 */
exports.getTemplates = async (req, res, next) => {
  try {
    const { category, language } = req.query;

    const templates = await Template.getAll({ category, language });

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single template
 * GET /api/templates/:id
 */
exports.getTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      throw new NotFoundError('Template not found');
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new template
 * POST /api/templates
 */
exports.createTemplate = async (req, res, next) => {
  try {
    const { name, content, variables, language, category } = req.body;

    const template = await Template.create({
      name,
      content,
      variables: variables || [],
      language: language || 'urdu',
      category: category || 'general'
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update template
 * PUT /api/templates/:id
 */
exports.updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const template = await Template.findById(id);
    if (!template) {
      throw new NotFoundError('Template not found');
    }

    const updated = await Template.update(id, updates);

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete template
 * DELETE /api/templates/:id
 */
exports.deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await Template.findById(id);
    if (!template) {
      throw new NotFoundError('Template not found');
    }

    await Template.delete(id);

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render template with variables
 * POST /api/templates/:id/render
 */
exports.renderTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { variables } = req.body;

    const template = await Template.findById(id);
    if (!template) {
      throw new NotFoundError('Template not found');
    }

    const rendered = await Template.render(id, variables);

    res.json({
      success: true,
      data: {
        rendered
      }
    });
  } catch (error) {
    next(error);
  }
};
