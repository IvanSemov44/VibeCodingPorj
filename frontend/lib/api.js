/**
 * API client for backend communication
 * Handles CSRF tokens, authentication, and error handling
 * @module api
 */

import { API_BASE_URL, API_ENDPOINTS } from './constants';
import { ApiError, handleApiError } from './errors';

const BASE = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Get cookie value by name (browser only)
 * @private
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Store CSRF token optionally, but prefer reading cookie at request time
let csrfToken = null;

function currentXsrf() {
  return getCookie('XSRF-TOKEN') || csrfToken || '';
}

/**
 * Fetch wrapper with authentication headers and CSRF token
 * @private
 * @param {string} url - Request URL
 * @param {RequestInit} [options={}] - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithAuth(url, options = {}) {
  const headers = {
    'Accept': 'application/json',
    ...options.headers
  };

  const token = currentXsrf();
  if (token) {
    headers['X-XSRF-TOKEN'] = token;
  }

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers
  });

  return response;
}

/**
 * Fetch CSRF token from backend
 * Should be called before making authenticated requests
 * @returns {Promise<Response>} CSRF response
 * @throws {ApiError} If CSRF fetch fails
 * @example
 * await getCsrf();
 * // CSRF token now stored in cookie
 */
export async function getCsrf() {
  try {
    const res = await fetchWithAuth(`${BASE}${API_ENDPOINTS.CSRF}`);
    
    const cookieVal = getCookie('XSRF-TOKEN');
    if (cookieVal) csrfToken = cookieVal;

    return res;
  } catch (err) {
    console.error('CSRF fetch error:', err);
    throw handleApiError(err);
  }
}

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Response>} Login response with user data
 * @throws {ApiError} If login fails with validation errors
 * @example
 * const res = await login('user@example.com', 'password123');
 * const user = await res.json();
 */
export async function login(email, password) {
  try {
    const res = await fetchWithAuth(`${BASE}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || 'Login failed',
        res.status,
        errorData.errors
      );
    }

    return res;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw handleApiError(err);
  }
}

/**
 * Get currently authenticated user
 * @returns {Promise<Response>} Response with user data or 401 if not authenticated
 * @example
 * const res = await getUser();
 * if (res.ok) {
 *   const user = await res.json();
 * }
 */
export async function getUser() {
  try {
    const res = await fetch(`${BASE}/api/user`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    // Don't log 401 as error - it's expected when not logged in
    if (!res.ok && res.status !== 401) {
      console.error('Get user error:', res.status, res.statusText);
    }
    return res;
  } catch (err) {
    console.error('Get user error:', err);
    throw err;
  }
}

/**
 * Register new user account
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} passwordConfirmation - Password confirmation (must match password)
 * @returns {Promise<Response>} Registration response with user data
 * @throws {ApiError} If registration fails with validation errors
 * @example
 * const res = await register('John Doe', 'john@example.com', 'password123', 'password123');
 * const user = await res.json();
 */
export async function register(name, email, password, passwordConfirmation) {
  try {
    const res = await fetchWithAuth(`${BASE}${API_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        email, 
        password, 
        password_confirmation: passwordConfirmation 
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || 'Registration failed',
        res.status,
        errorData.errors
      );
    }

    return res;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw handleApiError(err);
  }
}

/**
 * Logout current user
 * @returns {Promise<Response>} Logout response
 * @throws {ApiError} If logout fails
 * @example
 * await logout();
 * // User session invalidated
 */
export async function logout() {
  try {
    return await fetchWithAuth(`${BASE}${API_ENDPOINTS.LOGOUT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Logout error:', err);
    throw handleApiError(err);
  }
}

/**
 * Get journal entries with optional filters
 * @param {Object} params - Query parameters
 * @param {string} [params.search] - Search term for title/content
 * @param {string} [params.mood] - Filter by mood
 * @param {string} [params.tag] - Filter by tag
 * @returns {Promise<Response>} Response with journal entries array
 * @throws {ApiError} If fetch fails
 */
export async function getJournalEntries(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE}/api/journal${queryString ? '?' + queryString : ''}`;
    return await fetchWithAuth(url);
  } catch (err) {
    console.error('Get journal entries error:', err);
    throw handleApiError(err);
  }
}

/**
 * Create a new journal entry
 * @param {Object} data - Journal entry data
 * @param {string} data.title - Entry title
 * @param {string} data.content - Entry content
 * @param {string} data.mood - Mood (excited, happy, neutral, tired, victorious)
 * @param {string[]} [data.tags] - Optional tags array
 * @param {number} data.xp - XP points (1-100)
 * @returns {Promise<Response>} Response with created entry
 * @throws {ApiError} If creation fails with validation errors
 */
export async function createJournalEntry(data) {
  try {
    const res = await fetchWithAuth(`${BASE}/api/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || 'Failed to create journal entry',
        res.status,
        errorData.errors
      );
    }

    return res;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw handleApiError(err);
  }
}

/**
 * Update an existing journal entry
 * @param {number} id - Entry ID
 * @param {Object} data - Updated entry data
 * @returns {Promise<Response>} Response with updated entry
 * @throws {ApiError} If update fails
 */
export async function updateJournalEntry(id, data) {
  try {
    const res = await fetchWithAuth(`${BASE}/api/journal/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || 'Failed to update journal entry',
        res.status,
        errorData.errors
      );
    }

    return res;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw handleApiError(err);
  }
}

/**
 * Delete a journal entry
 * @param {number} id - Entry ID
 * @returns {Promise<Response>} Response confirming deletion
 * @throws {ApiError} If deletion fails
 */
export async function deleteJournalEntry(id) {
  try {
    return await fetchWithAuth(`${BASE}/api/journal/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.error('Delete journal entry error:', err);
    throw handleApiError(err);
  }
}

/**
 * Get journal statistics
 * @returns {Promise<Response>} Response with stats object
 * @throws {ApiError} If fetch fails
 */
export async function getJournalStats() {
  try {
    return await fetchWithAuth(`${BASE}/api/journal/stats`);
  } catch (err) {
    console.error('Get journal stats error:', err);
    throw handleApiError(err);
  }
}
