/**
 * Custom hook for accessing theme state from Redux
 * Replaces the old useTheme hook from ThemeContext
 */

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleTheme as toggleThemeAction, setTheme, Theme } from '../store/themeSlice';

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

export function useAppTheme(): UseThemeReturn {
  const dispatch = useDispatch();
  const { theme, mounted } = useSelector((state: RootState) => state.theme);

  const toggleTheme = () => {
    dispatch(toggleThemeAction());
  };

  const handleSetTheme = (newTheme: Theme) => {
    dispatch(setTheme(newTheme));
  };

  return {
    theme,
    toggleTheme,
    setTheme: handleSetTheme,
    mounted,
  };
}
