/**
 * Formatting Utilities
 * Data formatting and transformation functions
 */

/**
 * Format phone number (Pakistani format)
 */
function formatPhone(phone) {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  // If starts with 92, add +
  if (cleaned.startsWith('92')) {
    return '+' + cleaned;
  }
  
  // If starts with 0, replace with +92
  if (cleaned.startsWith('0')) {
    return '+92' + cleaned.slice(1);
  }
  
  // Otherwise add +92
  return '+92' + cleaned;
}

/**
 * Format price (Pakistani Rupees)
 */
function formatPrice(price, includeCurrency = true) {
  if (price === null || price === undefined) return '';
  
  const formatted = parseFloat(price).toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return includeCurrency ? `Rs. ${formatted}` : formatted;
}

/**
 * Format date (human-readable)
 */
function formatDate(date, format = 'full') {
  if (!date) return '';
  
  const d = new Date(date);
  
  switch (format) {
    case 'date':
      return d.toLocaleDateString('en-PK');
    case 'time':
      return d.toLocaleTimeString('en-PK');
    case 'short':
      return d.toLocaleDateString('en-PK', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    case 'full':
    default:
      return d.toLocaleString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  
  return formatDate(date, 'short');
}

/**
 * Truncate text with ellipsis
 */
function truncate(text, maxLength = 100, suffix = '...') {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert to title case
 */
function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Format file size (bytes to human-readable)
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration (seconds to human-readable)
 */
function formatDuration(seconds) {
  if (!seconds) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

/**
 * Format percentage
 */
function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined) return '0%';
  return `${parseFloat(value).toFixed(decimals)}%`;
}

/**
 * Format WhatsApp message (add proper formatting)
 */
function formatWhatsAppMessage(text) {
  if (!text) return '';
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '*$1*') // Bold
    .replace(/__(.*?)__/g, '_$1_') // Italic
    .replace(/~~(.*?)~~/g, '~$1~'); // Strikethrough
}

/**
 * Slugify string (URL-friendly)
 */
function slugify(str) {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse JSON safely
 */
function parseJSON(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

/**
 * Format order status (user-friendly)
 */
function formatOrderStatus(status) {
  const statusMap = {
    pending: 'Pending',
    payment_pending: 'Awaiting Payment',
    paid: 'Paid',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
  };
  
  return statusMap[status] || capitalize(status);
}

/**
 * Mask sensitive data
 */
function maskData(data, type = 'default') {
  if (!data) return '';
  
  switch (type) {
    case 'email':
      const [name, domain] = data.split('@');
      return `${name.charAt(0)}${'*'.repeat(name.length - 2)}${name.charAt(name.length - 1)}@${domain}`;
    
    case 'phone':
      return data.slice(0, 4) + '*'.repeat(data.length - 8) + data.slice(-4);
    
    case 'card':
      return '*'.repeat(data.length - 4) + data.slice(-4);
    
    default:
      return '*'.repeat(data.length - 4) + data.slice(-4);
  }
}

module.exports = {
  formatPhone,
  formatPrice,
  formatDate,
  formatRelativeTime,
  truncate,
  capitalize,
  toTitleCase,
  formatFileSize,
  formatDuration,
  formatPercentage,
  formatWhatsAppMessage,
  slugify,
  parseJSON,
  formatOrderStatus,
  maskData
};
