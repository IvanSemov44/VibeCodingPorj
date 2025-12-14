/**
 * Custom hook for accessing theme state from Redux
 * Replaces the old useTheme hook from ThemeContext
 */

import useTheme from './useTheme';

export function useAppTheme() {
  // Delegate to the new `useTheme` hook which performs side-effects
  // (localStorage and DOM updates) while keeping reducers pure.
  return useTheme();
}
