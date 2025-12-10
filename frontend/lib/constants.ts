/**
 * Application constants for configuration, routes, and validation
 */
export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard'
} as const;

export const API_ENDPOINTS = {
  CSRF: '/sanctum/csrf-cookie',
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  LOGOUT: '/api/logout',
  USER: '/api/user',
  STATUS: '/api/status'
} as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 255,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_MAX_LENGTH: 255
} as const;

export const UI = {
  MAX_CONTAINER_WIDTH: 1100,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: '0.3s'
} as const;

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark'
} as const;

export const STORAGE_KEYS = {
  THEME: 'theme'
} as const;
