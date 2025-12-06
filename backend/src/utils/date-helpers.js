/**
 * Date Helper Utilities
 * Date manipulation and calculation functions
 */

/**
 * Get current timestamp
 */
function now() {
  return new Date();
}

/**
 * Add days to date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add hours to date
 */
function addHours(date, hours) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add minutes to date
 */
function addMinutes(date, minutes) {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Get start of day
 */
function startOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 */
function endOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of week
 */
function startOfWeek(date = new Date()) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  return startOfDay(result);
}

/**
 * Get end of week
 */
function endOfWeek(date = new Date()) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() + (6 - day);
  result.setDate(diff);
  return endOfDay(result);
}

/**
 * Get start of month
 */
function startOfMonth(date = new Date()) {
  const result = new Date(date);
  result.setDate(1);
  return startOfDay(result);
}

/**
 * Get end of month
 */
function endOfMonth(date = new Date()) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  return endOfDay(result);
}

/**
 * Check if date is today
 */
function isToday(date) {
  const today = new Date();
  const checkDate = new Date(date);
  
  return checkDate.getDate() === today.getDate() &&
         checkDate.getMonth() === today.getMonth() &&
         checkDate.getFullYear() === today.getFullYear();
}

/**
 * Check if date is within range
 */
function isWithinRange(date, startDate, endDate) {
  const check = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return check >= start && check <= end;
}

/**
 * Get difference in days
 */
function diffInDays(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get difference in hours
 */
function diffInHours(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60 * 60));
}

/**
 * Get difference in minutes
 */
function diffInMinutes(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60));
}

/**
 * Format date to ISO string
 */
function toISOString(date) {
  return new Date(date).toISOString();
}

/**
 * Parse ISO date string
 */
function fromISOString(isoString) {
  return new Date(isoString);
}

/**
 * Check if date is in the past
 */
function isPast(date) {
  return new Date(date) < new Date();
}

/**
 * Check if date is in the future
 */
function isFuture(date) {
  return new Date(date) > new Date();
}

/**
 * Get Pakistan timezone date
 */
function getPakistanTime() {
  return new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' });
}

module.exports = {
  now,
  addDays,
  addHours,
  addMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isToday,
  isWithinRange,
  diffInDays,
  diffInHours,
  diffInMinutes,
  toISOString,
  fromISOString,
  isPast,
  isFuture,
  getPakistanTime
};
