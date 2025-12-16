/**
 * Phone Formatter Utility Tests
 */

const phoneFormatter = require('../../src/utils/phone-formatter');

describe('Phone Formatter Utility', () => {
  describe('formatForWhatsApp', () => {
    it('should format Pakistani number starting with 03', () => {
      const result = phoneFormatter.formatForWhatsApp('03001234567');
      expect(result).toBe('923001234567');
    });

    it('should handle number with +92 prefix', () => {
      const result = phoneFormatter.formatForWhatsApp('+923001234567');
      expect(result).toBe('923001234567');
    });

    it('should handle number with 92 prefix', () => {
      const result = phoneFormatter.formatForWhatsApp('923001234567');
      expect(result).toBe('923001234567');
    });

    it('should handle number with spaces', () => {
      const result = phoneFormatter.formatForWhatsApp('0300 123 4567');
      expect(result).toBe('923001234567');
    });

    it('should handle number with dashes', () => {
      const result = phoneFormatter.formatForWhatsApp('0300-123-4567');
      expect(result).toBe('923001234567');
    });

    it('should handle international format', () => {
      const result = phoneFormatter.formatForWhatsApp('+1234567890');
      expect(result).toContain('1234567890');
    });
  });

  describe('fromChatId', () => {
    it('should extract phone number from WhatsApp chat ID', () => {
      const result = phoneFormatter.fromChatId('923001234567@c.us');
      expect(result).toBe('923001234567');
    });

    it('should handle chat ID without @c.us', () => {
      const result = phoneFormatter.fromChatId('923001234567');
      expect(result).toBe('923001234567');
    });
  });

  describe('isValidPakistaniNumber', () => {
    if (phoneFormatter.isValidPakistaniNumber) {
      it('should validate Pakistani mobile numbers', () => {
        const validNumbers = [
          '03001234567',
          '03211234567',
          '03331234567',
          '03451234567'
        ];

        validNumbers.forEach(num => {
          expect(phoneFormatter.isValidPakistaniNumber(num)).toBe(true);
        });
      });

      it('should reject invalid numbers', () => {
        const invalidNumbers = [
          '1234567',      // too short
          '12345678901234', // too long
          '04001234567',  // invalid prefix
        ];

        invalidNumbers.forEach(num => {
          expect(phoneFormatter.isValidPakistaniNumber(num)).toBe(false);
        });
      });
    }
  });

  describe('formatForDisplay', () => {
    if (phoneFormatter.formatForDisplay) {
      it('should format number for display', () => {
        const result = phoneFormatter.formatForDisplay('923001234567');
        expect(result).toContain('0300');
      });
    }
  });
});
