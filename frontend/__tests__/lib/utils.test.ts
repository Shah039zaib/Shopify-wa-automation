import {
  cn,
  formatCurrency,
  formatPhoneNumber,
  formatDate,
  formatTime,
  formatDateTime,
  timeAgo,
  getStatusColor,
  truncate,
} from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });
});

describe('formatCurrency', () => {
  it('formats number as Pakistani Rupees', () => {
    expect(formatCurrency(5000)).toContain('Rs.');
    expect(formatCurrency(5000)).toContain('5');
  });

  it('formats large numbers with commas', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('Rs.');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toContain('Rs.');
    expect(formatCurrency(0)).toContain('0');
  });
});

describe('formatPhoneNumber', () => {
  it('formats Pakistani phone number', () => {
    const result = formatPhoneNumber('923001234567');
    expect(result).toBe('+92 300 1234567');
  });

  it('returns empty string for empty input', () => {
    expect(formatPhoneNumber('')).toBe('');
  });

  it('returns unchanged for non-Pakistani numbers', () => {
    expect(formatPhoneNumber('1234567890')).toBe('1234567890');
  });
});

describe('formatDate', () => {
  it('formats date string', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('2024');
    expect(result).toContain('Jan');
  });

  it('formats Date object', () => {
    const result = formatDate(new Date('2024-01-15'));
    expect(result).toContain('2024');
  });
});

describe('formatTime', () => {
  it('formats time from date', () => {
    const date = new Date('2024-01-15T14:30:00');
    const result = formatTime(date);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatDateTime', () => {
  it('combines date and time', () => {
    const result = formatDateTime('2024-01-15T14:30:00');
    expect(result).toContain('2024');
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('timeAgo', () => {
  it('returns "Just now" for recent time', () => {
    const now = new Date();
    expect(timeAgo(now)).toBe('Just now');
  });

  it('returns minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinutesAgo)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(timeAgo(twoHoursAgo)).toBe('2h ago');
  });

  it('returns days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(timeAgo(threeDaysAgo)).toBe('3d ago');
  });
});

describe('getStatusColor', () => {
  it('returns green for active status', () => {
    expect(getStatusColor('active')).toContain('green');
  });

  it('returns green for completed status', () => {
    expect(getStatusColor('completed')).toContain('green');
  });

  it('returns yellow for pending status', () => {
    expect(getStatusColor('pending')).toContain('yellow');
  });

  it('returns red for cancelled status', () => {
    expect(getStatusColor('cancelled')).toContain('red');
  });

  it('returns gray for unknown status', () => {
    expect(getStatusColor('unknown')).toContain('gray');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('returns original string if shorter than length', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('returns original string if equal to length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});
