/**
 * @deprecated Use `useTheme` from './useTheme' instead.
 * This is kept for backward compatibility only.
 *
 * Custom hook for accessing theme state from Redux.
 * This is a simple re-export of the consolidated useTheme hook.
 */

import { useTheme } from './useTheme';

/** @deprecated Use useTheme instead */
export function useAppTheme() {
  return useTheme();
}
