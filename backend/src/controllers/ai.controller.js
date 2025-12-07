/**
 * AI Controller
 * AI provider and configuration management
 */

const AIProvider = require('../models/AIProvider');
const AIKey = require('../models/AIKey');
const AIPrompt = require('../models/AIPrompt');
const AILog = require('../models/AILog');
const AIAnalytics = require('../models/AIAnalytics');
const { NotFoundError, BadRequestError } = require('../utils/error-handler');

/**
 * Get all AI providers
 * GET /api/ai/providers
 */
exports.getProviders = async (req, res, next) => {
  try {
    const providers = await AIProvider.getAll();

    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single AI provider
 * GET /api/ai/providers/:id
 */
exports.getProvider = async (req, res, next) => {
  try {
    const { id } = req.params;

    const provider = await AIProvider.getStats(id);
    if (!provider) {
      throw new NotFoundError('AI provider not found');
    }

    res.json({
      success: true,
      data: provider
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update AI provider settings
 * PUT /api/ai/providers/:id
 */
exports.updateProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const provider = await AIProvider.findById(id);
    if (!provider) {
      throw new NotFoundError('AI provider not found');
    }

    const updated = await AIProvider.update(id, updates);

    res.json({
      success: true,
      message: 'Provider updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test AI provider connection
 * POST /api/ai/providers/:id/test
 */
exports.testProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { test_message } = req.body;

    const provider = await AIProvider.findById(id);
    if (!provider) {
      throw new NotFoundError('AI provider not found');
    }

    // Get AI service based on provider name
    const aiService = require(`../services/ai-${provider.name.toLowerCase()}.service`);
    
    const startTime = Date.now();
    const response = await aiService.sendRequest(test_message);
    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      message: 'AI provider tested successfully',
      data: {
        provider: provider.name,
        responseTime: `${responseTime}ms`,
        response: response.substring(0, 200) // Truncate for display
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all AI keys (masked)
 * GET /api/ai/keys
 */
exports.getKeys = async (req, res, next) => {
  try {
    const keys = await AIKey.getAll();

    res.json({
      success: true,
      data: keys
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add new AI key
 * POST /api/ai/keys
 */
exports.addKey = async (req, res, next) => {
  try {
    const { provider_id, api_key, requests_limit } = req.body;

    const provider = await AIProvider.findById(provider_id);
    if (!provider) {
      throw new NotFoundError('AI provider not found');
    }

    const key = await AIKey.create({
      provider_id,
      api_key,
      requests_limit
    });

    res.status(201).json({
      success: true,
      message: 'API key added successfully',
      data: key
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete AI key
 * DELETE /api/ai/keys/:id
 */
exports.deleteKey = async (req, res, next) => {
  try {
    const { id } = req.params;

    const key = await AIKey.findById(id);
    if (!key) {
      throw new NotFoundError('API key not found');
    }

    await AIKey.delete(id);

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all AI prompts
 * GET /api/ai/prompts
 */
exports.getPrompts = async (req, res, next) => {
  try {
    const { type, language } = req.query;

    const prompts = await AIPrompt.getAll({ type, language });

    res.json({
      success: true,
      data: prompts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single prompt
 * GET /api/ai/prompts/:id
 */
exports.getPrompt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const prompt = await AIPrompt.findById(id);
    if (!prompt) {
      throw new NotFoundError('Prompt not found');
    }

    res.json({
      success: true,
      data: prompt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new prompt
 * POST /api/ai/prompts
 */
exports.createPrompt = async (req, res, next) => {
  try {
    const { name, type, content, language } = req.body;

    const prompt = await AIPrompt.create({
      name,
      type,
      content,
      language: language || 'urdu'
    });

    res.status(201).json({
      success: true,
      message: 'Prompt created successfully',
      data: prompt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update prompt
 * PUT /api/ai/prompts/:id
 */
exports.updatePrompt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const prompt = await AIPrompt.findById(id);
    if (!prompt) {
      throw new NotFoundError('Prompt not found');
    }

    const updated = await AIPrompt.update(id, updates);

    res.json({
      success: true,
      message: 'Prompt updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete prompt
 * DELETE /api/ai/prompts/:id
 */
exports.deletePrompt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const prompt = await AIPrompt.findById(id);
    if (!prompt) {
      throw new NotFoundError('Prompt not found');
    }

    await AIPrompt.delete(id);

    res.json({
      success: true,
      message: 'Prompt deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI logs
 * GET /api/ai/logs
 */
exports.getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, provider_id, success } = req.query;

    const result = await AILog.getAll({
      page: parseInt(page),
      limit: parseInt(limit),
      provider_id,
      success: success !== undefined ? success === 'true' : null
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI performance analytics
 * GET /api/ai/analytics
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const [overallStats, providerComparison, dailyUsage] = await Promise.all([
      AIAnalytics.getOverallStats(start_date, end_date),
      AIAnalytics.getProviderComparison(start_date, end_date),
      AIAnalytics.getDailyUsage(7)
    ]);

    res.json({
      success: true,
      data: {
        overall: overallStats,
        providers: providerComparison,
        dailyUsage
      }
    });
  } catch (error) {
    next(error);
  }
};
