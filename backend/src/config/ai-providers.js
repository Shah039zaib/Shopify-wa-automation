/**
 * AI Providers Configuration
 * Settings for all AI providers (Claude, Gemini, Groq, Cohere, etc.)
 */

const aiProvidersConfig = {
  // Anthropic Claude
  claude: {
    name: 'Claude',
    apiKey: process.env.CLAUDE_API_KEY,
    baseURL: 'https://api.anthropic.com/v1',
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 1024,
    temperature: 0.7,
    enabled: !!process.env.CLAUDE_API_KEY,
    priority: 1, // Higher priority = used first
    rateLimit: {
      requestsPerDay: 1000,
      requestsPerMinute: 50
    }
  },

  // Google Gemini
  gemini: {
    name: 'Gemini',
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-pro',
    maxTokens: 1024,
    temperature: 0.7,
    enabled: !!process.env.GEMINI_API_KEY,
    priority: 2,
    rateLimit: {
      requestsPerDay: 1500,
      requestsPerMinute: 60
    }
  },

  // Groq
  groq: {
    name: 'Groq',
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
    model: 'mixtral-8x7b-32768',
    maxTokens: 1024,
    temperature: 0.7,
    enabled: !!process.env.GROQ_API_KEY,
    priority: 3,
    rateLimit: {
      requestsPerDay: 14400,
      requestsPerMinute: 30
    }
  },

  // Cohere
  cohere: {
    name: 'Cohere',
    apiKey: process.env.COHERE_API_KEY,
    baseURL: 'https://api.cohere.ai/v1',
    model: 'command',
    maxTokens: 1024,
    temperature: 0.7,
    enabled: !!process.env.COHERE_API_KEY,
    priority: 4,
    rateLimit: {
      requestsPerDay: 1000,
      requestsPerMinute: 20
    }
  }
};

/**
 * Default AI Prompts (System Messages)
 */
const defaultPrompts = {
  // Welcome message when customer first contacts
  welcome: {
    urdu: `Aap ek professional sales assistant hain jo Shopify store creation service bechte hain. Customer ko warm welcome do aur unki madad karne ke liye ready ho. Friendly aur helpful tone rakho.`,
    
    english: `You are a professional sales assistant selling Shopify store creation services. Welcome the customer warmly and be ready to help. Maintain a friendly and helpful tone.`
  },

  // Sales conversation
  sales: {
    urdu: `Aap customer se baat kar rahe ho jo Shopify store banana chahta hai. Aapko:
1. Customer ki requirements samajhni hain
2. Best package suggest karna hai (Basic, Standard, Premium)
3. Features explain karne hain
4. Questions ka jawab dena hai
5. Professional aur convincing rahna hai
Always Roman Urdu mein respond karo agar customer Urdu mein baat kare.`,

    english: `You are talking to a customer who wants to build a Shopify store. You need to:
1. Understand customer requirements
2. Suggest the best package (Basic, Standard, Premium)
3. Explain features clearly
4. Answer questions professionally
5. Be convincing but not pushy`
  },

  // Payment request
  payment: {
    urdu: `Customer ne package select kar liya hai. Ab payment request bhejo politely. Payment details automatically share hongi. Professional aur clear communication rakho.`,
    
    english: `Customer has selected a package. Now request payment politely. Payment details will be shared automatically. Keep communication professional and clear.`
  },

  // Follow-up
  followup: {
    urdu: `Customer ne pehle inquiry ki thi lekin order complete nahi kiya. Friendly follow-up karo without being pushy. Offer help agar koi confusion hai.`,
    
    english: `Customer inquired before but didn't complete the order. Follow up in a friendly way without being pushy. Offer help if there's any confusion.`
  }
};

/**
 * AI Response Guidelines
 */
const responseGuidelines = {
  maxLength: 200, // Maximum response length in words
  tone: 'professional-friendly',
  language: 'auto-detect', // Auto-detect customer language
  fallbackLanguage: 'urdu', // Default to Urdu if detection fails
  
  // Things AI should avoid
  avoid: [
    'Making false promises',
    'Giving exact delivery dates without confirmation',
    'Discussing competitors negatively',
    'Sharing personal information',
    'Making commitments outside service scope'
  ],

  // Things AI should do
  shouldDo: [
    'Understand customer needs first',
    'Suggest appropriate package',
    'Answer questions clearly',
    'Be polite and professional',
    'Request payment when ready',
    'Confirm order details'
  ]
};

/**
 * Get enabled AI providers sorted by priority
 */
function getEnabledProviders() {
  return Object.entries(aiProvidersConfig)
    .filter(([_, config]) => config.enabled)
    .sort((a, b) => a[1].priority - b[1].priority)
    .map(([name, config]) => ({ name, ...config }));
}

/**
 * Get provider config by name
 */
function getProviderConfig(providerName) {
  return aiProvidersConfig[providerName.toLowerCase()];
}

module.exports = {
  aiProvidersConfig,
  defaultPrompts,
  responseGuidelines,
  getEnabledProviders,
  getProviderConfig
};
