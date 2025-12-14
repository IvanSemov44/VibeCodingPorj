import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setTheme, toggleTheme, initializeTheme, type Theme } from '../store/themeSlice';

export default function useTheme() {
  const dispatch = useDispatch();
  const { theme, mounted } = useSelector((s: RootState) => s.theme);

  // Run once on client to initialize from localStorage and DOM
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = (localStorage.getItem('theme') as Theme) || null;
    if (saved) {
      dispatch(setTheme(saved));
      try {
        document.documentElement.setAttribute('data-theme', saved);
      } catch {
        // ignore DOM update errors in non-DOM environments
      }
    } else {
      // ensure DOM reflects current theme value
      try {
        document.documentElement.setAttribute('data-theme', theme);
      } catch {}
    }

    dispatch(initializeTheme());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep localStorage and DOM in sync when `theme` changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // ignore
    }
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggle = useCallback(() => dispatch(toggleTheme()), [dispatch]);
  const set = useCallback((t: Theme) => dispatch(setTheme(t)), [dispatch]);

  return { theme, mounted, toggleTheme: toggle, setTheme: set };
}
