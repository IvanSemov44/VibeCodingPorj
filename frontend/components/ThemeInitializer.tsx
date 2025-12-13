/**
 * ThemeInitializer Component
 *
 * Initializes the theme from localStorage when the app first loads.
 * Must be rendered inside Redux Provider to access dispatch.
 *
 * This component:
 * 1. Runs once on mount
 * 2. Reads theme from localStorage
 * 3. Updates Redux state
 * 4. Sets data-theme attribute on document root
 */

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeTheme } from '../store/themeSlice';

interface ThemeInitializerProps {
  children: React.ReactNode;
}

export function ThemeInitializer({ children }: ThemeInitializerProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize theme from localStorage on mount
    // This ensures the theme is loaded before the UI renders
    dispatch(initializeTheme());
  }, [dispatch]);

  // This component is transparent - it just initializes and passes children through
  return <>{children}</>;
}
