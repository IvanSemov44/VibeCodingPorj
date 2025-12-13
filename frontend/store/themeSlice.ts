import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  mounted: boolean;
}

const initialState: ThemeState = {
  theme: 'light',
  mounted: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;

      // Update localStorage (side effect - consider using middleware in production)
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }

      // Update DOM attribute
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', action.payload);
      }
    },

    toggleTheme: (state) => {
      const newTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }

      // Update DOM attribute
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    },

    initializeTheme: (state) => {
      // Load theme from localStorage
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        const theme = savedTheme || 'light';
        state.theme = theme;
        state.mounted = true;

        // Set DOM attribute
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      } else {
        state.mounted = true;
      }
    },
  },
});

export const { setTheme, toggleTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;
