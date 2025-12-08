/**
 * Application constants for configuration, routes, and validation
 * Centralized constants prevent magic strings/numbers throughout codebase
 * @module constants
 */

/**
 * API base URL from environment or default
 * @constant {string}
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

/**
 * Frontend route paths
 * @constant {Object}
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard'
};

/**
 * Backend API endpoint paths
 * @constant {Object}
 */
export const API_ENDPOINTS = {
  CSRF: '/sanctum/csrf-cookie',
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  LOGOUT: '/api/logout',
  USER: '/api/user',
  STATUS: '/api/status'
};

/**
 * Form validation rules and patterns
 * @constant {Object}
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 255,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_MAX_LENGTH: 255
};

/**
 * UI configuration constants
 * @constant {Object}
 */
export const UI = {
  MAX_CONTAINER_WIDTH: 1100,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: '0.3s'
};

/**
 * Theme mode values
 * @constant {Object}
 */
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark'
};

/**
 * Local storage key names
 * @constant {Object}
 */
export const STORAGE_KEYS = {
  THEME: 'theme'
};
