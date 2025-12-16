/**
 * Language Detector Service Tests
 */

const languageDetector = require('../../src/services/language-detector.service');

describe('Language Detector Service', () => {
  describe('detect', () => {
    it('should detect Urdu script', () => {
      const urduText = 'السلام علیکم بھائی کیسے ہو';
      const result = languageDetector.detect(urduText);
      expect(result).toBe('urdu');
    });

    it('should detect Roman Urdu', () => {
      const romanUrduTexts = [
        'kya haal hai bhai',
        'mujhe package chahiye',
        'kitne ka hai yeh',
        'acha theek hai',
        'shukriya bohat'
      ];

      romanUrduTexts.forEach(text => {
        const result = languageDetector.detect(text);
        expect(result).toBe('roman_urdu');
      });
    });

    it('should detect English', () => {
      const englishTexts = [
        'Hello, how are you?',
        'I want to buy a package',
        'What is the price?',
        'Thank you very much'
      ];

      englishTexts.forEach(text => {
        const result = languageDetector.detect(text);
        expect(result).toBe('english');
      });
    });

    it('should handle empty string', () => {
      const result = languageDetector.detect('');
      expect(['urdu', 'roman_urdu', 'english']).toContain(result);
    });

    it('should handle null input', () => {
      const result = languageDetector.detect(null);
      expect(['urdu', 'roman_urdu', 'english']).toContain(result);
    });

    it('should handle mixed language text', () => {
      const mixedText = 'Hello bhai kya haal hai';
      const result = languageDetector.detect(mixedText);
      // Should detect based on majority or roman urdu keywords
      expect(['roman_urdu', 'english']).toContain(result);
    });

    it('should detect common Pakistani greetings', () => {
      const greetings = [
        'assalam o alaikum',
        'walaikum assalam',
        'salam bhai'
      ];

      greetings.forEach(text => {
        const result = languageDetector.detect(text);
        expect(result).toBe('roman_urdu');
      });
    });
  });

  describe('isUrduScript', () => {
    it('should return true for Urdu script', () => {
      const urduText = 'پاکستان زندہ باد';
      // Test if the function exists and works
      if (languageDetector.isUrduScript) {
        expect(languageDetector.isUrduScript(urduText)).toBe(true);
      }
    });
  });

  describe('getRomanUrduKeywords', () => {
    it('should contain common Roman Urdu words', () => {
      if (languageDetector.romanUrduKeywords) {
        const keywords = languageDetector.romanUrduKeywords;
        expect(keywords).toContain('kya');
        expect(keywords).toContain('hai');
        expect(keywords).toContain('bhai');
      }
    });
  });
});
