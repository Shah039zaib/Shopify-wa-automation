/**
 * Application Constants
 * Centralized constant values used throughout the application
 */

module.exports = {
  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    USER: 'user'
  },

  // Message Types
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    DOCUMENT: 'document',
    STICKER: 'sticker',
    LOCATION: 'location',
    CONTACT: 'contact'
  },

  // Message Sender Types
  SENDER_TYPES: {
    CUSTOMER: 'customer',
    BOT: 'bot',
    ADMIN: 'admin'
  },

  // Conversation Status
  CONVERSATION_STATUS: {
    ACTIVE: 'active',
    CLOSED: 'closed',
    PENDING: 'pending'
  },

  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    PAYMENT_PENDING: 'payment_pending',
    PAID: 'paid',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },

  // Payment Methods
  PAYMENT_METHODS: {
    EASYPAISA: 'easypaisa',
    JAZZCASH: 'jazzcash',
    BANK_TRANSFER: 'bank_transfer'
  },

  // WhatsApp Connection Status
  WA_CONNECTION_STATUS: {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    READY: 'ready',
    TIMEOUT: 'timeout',
    QR_RECEIVED: 'qr_received'
  },

  // AI Providers
  AI_PROVIDERS: {
    CLAUDE: 'claude',
    GEMINI: 'gemini',
    GROQ: 'groq',
    COHERE: 'cohere',
    HUGGINGFACE: 'huggingface'
  },

  // Languages Supported
  LANGUAGES: {
    ROMAN_URDU: 'roman_urdu',
    URDU: 'urdu',
    ENGLISH: 'english',
    PUNJABI: 'punjabi',
    SINDHI: 'sindhi'
  },

  // Safety Event Types
  SAFETY_EVENT_TYPES: {
    RATE_LIMIT_WARNING: 'rate_limit_warning',
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    ACCOUNT_WARNING: 'account_warning',
    CONNECTION_ERROR: 'connection_error'
  },

  // Safety Severity Levels
  SAFETY_SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },

  // Risk Levels
  RISK_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  },

  // Template Categories
  TEMPLATE_CATEGORIES: {
    WELCOME: 'welcome',
    SALES: 'sales',
    PAYMENT: 'payment',
    FOLLOWUP: 'followup',
    CONFIRMATION: 'confirmation',
    SUPPORT: 'support'
  },

  // Setting Types
  SETTING_TYPES: {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    JSON: 'json'
  },

  // Setting Categories
  SETTING_CATEGORIES: {
    GENERAL: 'general',
    WHATSAPP: 'whatsapp',
    AI: 'ai',
    PAYMENT: 'payment',
    SECURITY: 'security',
    NOTIFICATION: 'notification'
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // Date Formats
  DATE_FORMATS: {
    DATE: 'YYYY-MM-DD',
    TIME: 'HH:mm:ss',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    TIMESTAMP: 'YYYY-MM-DD HH:mm:ss.SSS'
  },

  // File Upload Limits
  UPLOAD_LIMITS: {
    IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    VIDEO_MAX_SIZE: 50 * 1024 * 1024, // 50MB
    DOCUMENT_MAX_SIZE: 20 * 1024 * 1024 // 20MB
  },

  // Cache TTL (Time To Live) in seconds
  CACHE_TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400 // 24 hours
  },

  // WebSocket Events
  WS_EVENTS: {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    QR_CODE: 'qr_code',
    READY: 'ready',
    MESSAGE: 'message',
    MESSAGE_CREATE: 'message_create',
    AUTH_FAILURE: 'auth_failure',
    DISCONNECTED: 'disconnected'
  }
};
