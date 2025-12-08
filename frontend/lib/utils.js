/**
 * Format date to readable string
 * @param {Date|string|number} date - Date to format
 * @param {Intl.DateTimeFormatOptions} [options={}] - Additional formatting options
 * @returns {string} Formatted date string
 * @example
 * formatDate(new Date()) // "Dec 8, 2025"
 * formatDate('2025-12-08', { month: 'long' }) // "December 8, 2025"
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string or formatted date if > 7 days
 * @example
 * formatRelativeTime(Date.now() - 60000) // "1 minute ago"
 * formatRelativeTime(Date.now() - 3600000) // "1 hour ago"
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} [maxLength=100] - Maximum length before truncation
 * @param {string} [suffix='...'] - Suffix to append when truncated
 * @returns {string} Truncated text or original if under max length
 * @example
 * truncate('Long text here', 10) // "Long text ..."
 */
export function truncate(text, maxLength = 100, suffix = '...') {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
}

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Text with each word capitalized
 * @example
 * capitalize('hello world') // "Hello World"
 */
export function capitalize(text) {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format number with commas for thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Generate initials from name (max 2 characters)
 * @param {string} name - Full name
 * @returns {string} Uppercase initials
 * @example
 * getInitials('John Doe') // "JD"
 * getInitials('Jane Mary Smith') // "JM"
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Sleep/delay for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>} Promise that resolves after delay
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if object is empty (has no keys)
 * @param {Object} obj - Object to check
 * @returns {boolean} True if object has no keys
 * @example
 * isEmpty({}) // true
 * isEmpty({ key: 'value' }) // false
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Deep clone object using JSON serialization
 * Note: Does not preserve functions, Date objects, or undefined values
 * @param {Object} obj - Object to clone
 * @returns {Object} Deep cloned object
 * @example
 * const cloned = deepClone({ nested: { value: 1 } });
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Group array of objects by a specific key
 * @param {Array<Object>} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Object with grouped arrays
 * @example
 * const users = [{ role: 'admin', name: 'John' }, { role: 'user', name: 'Jane' }];
 * groupBy(users, 'role') // { admin: [{...}], user: [{...}] }
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}
