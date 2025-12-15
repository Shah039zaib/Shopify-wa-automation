/**
 * AI Router Service
 * Routes requests to appropriate AI provider with fallback support
 */

const { logger } = require('../utils/logger');
const { getEnabledProviders, getProviderConfig, responseGuidelines } = require('../config/ai-providers');
const AILog = require('../models/AILog');
const AIAnalytics = require('../models/AIAnalytics');

// AI Provider clients
const aiClients = {};

/**
 * Initialize AI clients
 */
function initializeClients() {
  const providers = getEnabledProviders();

  for (const provider of providers) {
    try {
      aiClients[provider.name.toLowerCase()] = createClient(provider);
      logger.info(`AI client initialized: ${provider.name}`);
    } catch (error) {
      logger.error(`Failed to initialize ${provider.name}:`, error);
    }
  }
}

/**
 * Create AI client based on provider
 */
function createClient(provider) {
  const name = provider.name.toLowerCase();

  switch (name) {
    case 'claude':
      return {
        name: 'claude',
        config: provider,
        call: callClaude
      };
    case 'gemini':
      return {
        name: 'gemini',
        config: provider,
        call: callGemini
      };
    case 'groq':
      return {
        name: 'groq',
        config: provider,
        call: callGroq
      };
    case 'cohere':
      return {
        name: 'cohere',
        config: provider,
        call: callCohere
      };
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}

/**
 * Get AI response with fallback
 */
async function getResponse(message, context, language) {
  const providers = getEnabledProviders();

  if (providers.length === 0) {
    throw new Error('No AI providers configured');
  }

  const startTime = Date.now();
  let lastError = null;

  // Try each provider in priority order
  for (const provider of providers) {
    try {
      const client = aiClients[provider.name.toLowerCase()];

      if (!client) {
        logger.warn(`Client not found for provider: ${provider.name}`);
        continue;
      }

      logger.info(`Trying AI provider: ${provider.name}`);

      const response = await client.call(message, context, language, provider);

      // Log successful call
      const duration = Date.now() - startTime;
      await logAICall(provider.name, message, response.text, duration, true);

      return {
        text: response.text,
        provider: provider.name,
        model: provider.model,
        duration
      };
    } catch (error) {
      logger.error(`AI provider ${provider.name} failed:`, error);
      lastError = error;

      // Log failed call
      await logAICall(provider.name, message, null, Date.now() - startTime, false, error.message);

      // Continue to next provider
      continue;
    }
  }

  // All providers failed
  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
}

/**
 * Call Claude API
 */
async function callClaude(message, context, language, config) {
  const axios = require('axios');

  const systemPrompt = buildSystemPrompt(context, language);
  const messages = buildMessages(message, context);

  const response = await axios.post(
    `${config.baseURL}/messages`,
    {
      model: config.model,
      max_tokens: config.maxTokens,
      messages: messages,
      system: systemPrompt
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      timeout: 30000
    }
  );

  return {
    text: response.data.content[0].text
  };
}

/**
 * Call Gemini API
 */
async function callGemini(message, context, language, config) {
  const axios = require('axios');

  const systemPrompt = buildSystemPrompt(context, language);
  const prompt = `${systemPrompt}\n\nConversation History:\n${formatHistory(context.history)}\n\nCustomer: ${message}\n\nAssistant:`;

  const response = await axios.post(
    `${config.baseURL}/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens
      }
    },
    {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );

  return {
    text: response.data.candidates[0].content.parts[0].text
  };
}

/**
 * Call Groq API
 */
async function callGroq(message, context, language, config) {
  const axios = require('axios');

  const systemPrompt = buildSystemPrompt(context, language);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...buildMessages(message, context)
  ];

  const response = await axios.post(
    `${config.baseURL}/chat/completions`,
    {
      model: config.model,
      messages: messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      timeout: 30000
    }
  );

  return {
    text: response.data.choices[0].message.content
  };
}

/**
 * Call Cohere API
 */
async function callCohere(message, context, language, config) {
  const axios = require('axios');

  const systemPrompt = buildSystemPrompt(context, language);
  const chatHistory = context.history.map(msg => ({
    role: msg.role === 'user' ? 'USER' : 'CHATBOT',
    message: msg.content
  }));

  const response = await axios.post(
    `${config.baseURL}/chat`,
    {
      model: config.model,
      message: message,
      preamble: systemPrompt,
      chat_history: chatHistory,
      max_tokens: config.maxTokens,
      temperature: config.temperature
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      timeout: 30000
    }
  );

  return {
    text: response.data.text
  };
}

/**
 * Build system prompt
 */
function buildSystemPrompt(context, language) {
  const basePrompt = context.systemPrompt || '';
  const langInstruction = language === 'english'
    ? 'Respond in English.'
    : 'Respond in Roman Urdu (Urdu written in English letters). Be friendly and helpful.';

  const packageInfo = context.packages?.length > 0
    ? `\n\nAvailable Packages:\n${context.packages.map(p => `- ${p.name}: Rs. ${p.price} (${p.features?.slice(0, 3).join(', ')})`).join('\n')}`
    : '';

  return `${basePrompt}\n\n${langInstruction}${packageInfo}\n\nGuidelines:\n- Keep responses under ${responseGuidelines.maxLength} words\n- Be professional but friendly\n- Don't make false promises`;
}

/**
 * Build messages array for API call
 */
function buildMessages(currentMessage, context) {
  const messages = [];

  // Add history
  if (context.history) {
    for (const msg of context.history) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }
  }

  // Add current message
  messages.push({
    role: 'user',
    content: currentMessage
  });

  return messages;
}

/**
 * Format history for non-chat APIs
 */
function formatHistory(history) {
  if (!history || history.length === 0) return 'No previous messages.';

  return history.map(msg => {
    const role = msg.role === 'user' ? 'Customer' : 'Assistant';
    return `${role}: ${msg.content}`;
  }).join('\n');
}

/**
 * Log AI call
 */
async function logAICall(provider, input, output, duration, success, error = null) {
  try {
    await AILog.create({
      provider_id: null, // Provider ID would need to be looked up
      request_text: input?.substring(0, 500),
      response_text: output?.substring(0, 1000),
      response_time_ms: duration,
      success,
      error_message: error
    });

    // Update analytics
    await AIAnalytics.incrementUsage(provider, success);
  } catch (err) {
    logger.error('Failed to log AI call:', err);
  }
}

/**
 * Get provider status
 */
function getProviderStatus() {
  const providers = getEnabledProviders();

  return providers.map(provider => ({
    name: provider.name,
    enabled: provider.enabled,
    priority: provider.priority,
    model: provider.model,
    rateLimit: provider.rateLimit,
    clientInitialized: !!aiClients[provider.name.toLowerCase()]
  }));
}

/**
 * Test a specific provider
 */
async function testProvider(providerName) {
  const config = getProviderConfig(providerName);

  if (!config || !config.enabled) {
    return { success: false, error: 'Provider not configured or disabled' };
  }

  try {
    const response = await getResponse(
      'Hello, this is a test message.',
      { history: [], systemPrompt: 'Respond with a short greeting.' },
      'english'
    );

    return {
      success: true,
      response: response.text,
      provider: response.provider,
      duration: response.duration
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Initialize clients on module load
initializeClients();

module.exports = {
  getResponse,
  getProviderStatus,
  testProvider,
  initializeClients
};
