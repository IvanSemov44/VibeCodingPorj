/**
 * Custom error class for API errors
 * @class ApiError
 * @extends Error
 * @property {string} message - Error message
 * @property {number} status - HTTP status code
 * @property {Object} errors - Validation errors (field: message)
 */
export class ApiError extends Error {
  /**
   * Create an API error
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   * @param {Object} [errors={}] - Validation errors object
   */
  constructor(message, status, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Convert fetch error or response to ApiError
 * @param {Error} error - Original error
 * @param {Response} [res] - Fetch response object
 * @returns {ApiError} Formatted API error
 * @example
 * try {
 *   const res = await fetch('/api/endpoint');
 *   if (!res.ok) throw handleApiError(new Error(), res);
 * } catch (err) {
 *   // err is ApiError with status and errors
 * }
 */
export function handleApiError(error, res) {
  if (res && !res.ok) {
    if (res.status === 401) {
      return new ApiError('Unauthorized', 401);
    }
    if (res.status === 422) {
      // Laravel validation errors
      return new ApiError('Validation failed', 422, error.errors || {});
    }
    if (res.status === 419) {
      return new ApiError('CSRF token mismatch', 419);
    }
    if (res.status >= 500) {
      return new ApiError('Server error', res.status);
    }
  }
  
  return new ApiError(error.message || 'An unexpected error occurred', 0);
}

/**
 * Parse Laravel validation errors into flat object
 * Converts { field: ['error message'] } to { field: 'error message' }
 * @param {ApiError} apiError - API error with validation errors
 * @returns {Object} Flattened validation errors
 * @example
 * const errors = parseValidationErrors(apiError);
 * // { email: 'Email is required', password: 'Password too short' }
 */
export function parseValidationErrors(apiError) {
  if (apiError.status === 422 && apiError.errors) {
    // Laravel returns errors as { field: ['error message'] }
    const parsed = {};
    Object.keys(apiError.errors).forEach(field => {
      parsed[field] = Array.isArray(apiError.errors[field])
        ? apiError.errors[field][0]
        : apiError.errors[field];
    });
    return parsed;
  }
  return {};
}
