/**
 * Theme context for dark/light mode management
 * @module ThemeContext
 */

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * Theme provider component with localStorage persistence
 * Wraps app to provide theme state and toggle function
 * @param {Object} props
 * @param {React.ReactNode} props.children - App components
 * @returns {JSX.Element|null} Provider or null if not mounted
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme state and toggle function
 * @returns {Object} Theme context
 * @returns {('light'|'dark')} return.theme - Current theme
 * @returns {Function} return.toggleTheme - Function to toggle theme
 * @throws {Error} If used outside ThemeProvider
 * @example
 * const { theme, toggleTheme } = useTheme();
 * <button onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
