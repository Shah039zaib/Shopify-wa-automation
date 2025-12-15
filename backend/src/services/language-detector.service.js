/**
 * Language Detector Service
 * Detects language from text (Urdu, Roman Urdu, English)
 */

const { logger } = require('../utils/logger');

// Urdu Unicode range
const URDU_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Common Roman Urdu words and patterns
const ROMAN_URDU_WORDS = [
  'aap', 'ap', 'mein', 'main', 'hum', 'tum', 'kya', 'kia', 'hai', 'hain', 'tha', 'thi', 'the',
  'nahi', 'nhi', 'nahin', 'acha', 'acha', 'theek', 'thik', 'ji', 'jee',
  'mujhe', 'muje', 'mjhe', 'haan', 'han', 'bilkul',
  'kitna', 'kitne', 'kitni', 'kab', 'kahan', 'kaisay', 'kaise', 'kyun', 'kon',
  'chahiye', 'chahte', 'chahti', 'chahtay',
  'bhai', 'bhi', 'yar', 'yaar',
  'karo', 'kardo', 'karein', 'karain',
  'batao', 'batain', 'batayen', 'batado',
  'shukriya', 'shukria', 'meherbani', 'please', 'plz',
  'store', 'shopify', 'website', 'price', 'package',
  'salam', 'assalam', 'walaikum', 'aleikum',
  'paise', 'paisay', 'rupees', 'rupay',
  'wala', 'wali', 'walay',
  'dena', 'lena', 'dein', 'lein',
  'abhi', 'ab', 'phir', 'fir',
  'aur', 'ya', 'lekin', 'magar',
  'bohat', 'bahut', 'zyada', 'ziyada', 'kam',
  'acha', 'accha', 'theek', 'thik'
];

// Common English words that might appear in Roman Urdu
const MIXED_LANGUAGE_INDICATORS = [
  'ok', 'okay', 'yes', 'no', 'thanks', 'hi', 'hello', 'bye'
];

/**
 * Detect language of text
 * @param {string} text - Text to analyze
 * @returns {string} - 'urdu', 'roman_urdu', or 'english'
 */
function detect(text) {
  if (!text || typeof text !== 'string') {
    return 'english'; // Default
  }

  const normalizedText = text.toLowerCase().trim();

  // Check for Urdu script
  if (URDU_REGEX.test(text)) {
    return 'urdu';
  }

  // Count Roman Urdu words
  const words = normalizedText.split(/\s+/);
  let romanUrduCount = 0;
  let englishCount = 0;

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/gi, '');

    if (ROMAN_URDU_WORDS.includes(cleanWord)) {
      romanUrduCount++;
    } else if (isEnglishWord(cleanWord)) {
      englishCount++;
    }
  }

  // Calculate ratio
  const totalWords = words.length;
  const romanUrduRatio = romanUrduCount / totalWords;

  // If more than 20% words are Roman Urdu, classify as Roman Urdu
  if (romanUrduRatio > 0.2 || romanUrduCount >= 2) {
    return 'roman_urdu';
  }

  // Check for common greetings
  if (hasUrduGreeting(normalizedText)) {
    return 'roman_urdu';
  }

  return 'english';
}

/**
 * Check if word is likely English
 */
function isEnglishWord(word) {
  if (word.length < 2) return false;

  // Simple heuristic: check if word has common English patterns
  const englishPatterns = /^[a-z]+$/i;
  return englishPatterns.test(word) && !ROMAN_URDU_WORDS.includes(word);
}

/**
 * Check for Urdu/Islamic greetings
 */
function hasUrduGreeting(text) {
  const greetings = [
    'assalam', 'salam', 'walaikum', 'aleikum',
    'khuda hafiz', 'allah hafiz', 'jazak',
    'inshallah', 'mashallah', 'alhamdulillah'
  ];

  return greetings.some(greeting => text.includes(greeting));
}

/**
 * Get language display name
 */
function getLanguageName(code) {
  const names = {
    urdu: 'Urdu (اردو)',
    roman_urdu: 'Roman Urdu',
    english: 'English'
  };
  return names[code] || 'Unknown';
}

/**
 * Detect and return detailed info
 */
function detectWithDetails(text) {
  const language = detect(text);

  return {
    language,
    languageName: getLanguageName(language),
    isUrduScript: URDU_REGEX.test(text),
    confidence: calculateConfidence(text, language),
    analyzedText: text.substring(0, 100)
  };
}

/**
 * Calculate confidence score
 */
function calculateConfidence(text, detectedLanguage) {
  if (!text) return 0;

  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/);

  if (detectedLanguage === 'urdu') {
    // If Urdu script detected, high confidence
    const urduChars = (text.match(URDU_REGEX) || []).length;
    return Math.min(100, (urduChars / text.length) * 150);
  }

  if (detectedLanguage === 'roman_urdu') {
    let romanUrduCount = 0;
    for (const word of words) {
      if (ROMAN_URDU_WORDS.includes(word.replace(/[^a-z]/gi, ''))) {
        romanUrduCount++;
      }
    }
    return Math.min(100, (romanUrduCount / words.length) * 150);
  }

  // English confidence
  return 70; // Base confidence for English
}

/**
 * Check if response should be in Roman Urdu
 */
function shouldRespondInRomanUrdu(text) {
  const language = detect(text);
  return language === 'roman_urdu' || language === 'urdu';
}

module.exports = {
  detect,
  detectWithDetails,
  getLanguageName,
  shouldRespondInRomanUrdu,
  ROMAN_URDU_WORDS
};
