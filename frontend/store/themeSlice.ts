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
    },

    toggleTheme: (state) => {
      const newTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
    },

    initializeTheme: (state) => {
      // initialize only marks mounted; reading persisted value should be
      // performed by the `useTheme` hook on the client so reducers stay pure.
      state.mounted = true;
    },
  },
});

export const { setTheme, toggleTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;
