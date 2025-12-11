/**
 * Constants barrel export
 * Centralized import point for all application constants
 */

// Journal constants
export * from './journal';

// Dashboard constants
export * from './dashboard';

// Re-export existing constants from lib/constants.ts for backward compatibility
export { ROUTES, API_ENDPOINTS, VALIDATION, UI, THEME, STORAGE_KEYS, API_BASE_URL } from '../constants';
