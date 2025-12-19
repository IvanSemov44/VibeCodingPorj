import { describe, it, expect } from 'vitest';
import themeReducer, { setTheme, toggleTheme, initializeTheme, Theme } from '@/store/themeSlice';

describe('themeSlice', () => {
  const initialState = {
    theme: 'light' as Theme,
    mounted: false,
  };

  describe('reducer', () => {
    it('should return initial state when passed undefined state', () => {
      expect(themeReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle initial state', () => {
      const actual = themeReducer(undefined, { type: 'unknown' });
      expect(actual).toEqual({
        theme: 'light',
        mounted: false,
      });
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', () => {
      const actual = themeReducer(initialState, setTheme('dark'));
      expect(actual.theme).toBe('dark');
      expect(actual.mounted).toBe(false); // mounted should not change
    });

    it('should set theme to light', () => {
      const darkState = { theme: 'dark' as Theme, mounted: true };
      const actual = themeReducer(darkState, setTheme('light'));
      expect(actual.theme).toBe('light');
      expect(actual.mounted).toBe(true); // mounted should not change
    });

    it('should allow setting same theme', () => {
      const actual = themeReducer(initialState, setTheme('light'));
      expect(actual.theme).toBe('light');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      const actual = themeReducer(initialState, toggleTheme());
      expect(actual.theme).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      const darkState = { theme: 'dark' as Theme, mounted: false };
      const actual = themeReducer(darkState, toggleTheme());
      expect(actual.theme).toBe('light');
    });

    it('should toggle multiple times correctly', () => {
      let state = initialState;

      // light -> dark
      state = themeReducer(state, toggleTheme());
      expect(state.theme).toBe('dark');

      // dark -> light
      state = themeReducer(state, toggleTheme());
      expect(state.theme).toBe('light');

      // light -> dark
      state = themeReducer(state, toggleTheme());
      expect(state.theme).toBe('dark');
    });

    it('should not change mounted state when toggling', () => {
      const mountedState = { theme: 'light' as Theme, mounted: true };
      const actual = themeReducer(mountedState, toggleTheme());
      expect(actual.mounted).toBe(true);
    });
  });

  describe('initializeTheme', () => {
    it('should set mounted to true', () => {
      const actual = themeReducer(initialState, initializeTheme());
      expect(actual.mounted).toBe(true);
    });

    it('should not change theme when initializing', () => {
      const actual = themeReducer(initialState, initializeTheme());
      expect(actual.theme).toBe('light');
    });

    it('should work when already mounted', () => {
      const mountedState = { theme: 'dark' as Theme, mounted: true };
      const actual = themeReducer(mountedState, initializeTheme());
      expect(actual.mounted).toBe(true);
      expect(actual.theme).toBe('dark');
    });
  });

  describe('action creators', () => {
    it('setTheme should create correct action', () => {
      expect(setTheme('dark')).toEqual({
        type: 'theme/setTheme',
        payload: 'dark',
      });
    });

    it('toggleTheme should create correct action', () => {
      expect(toggleTheme()).toEqual({
        type: 'theme/toggleTheme',
      });
    });

    it('initializeTheme should create correct action', () => {
      expect(initializeTheme()).toEqual({
        type: 'theme/initializeTheme',
      });
    });
  });

  describe('complex scenarios', () => {
    it('should handle sequence of actions correctly', () => {
      let state = initialState;

      // Initialize
      state = themeReducer(state, initializeTheme());
      expect(state).toEqual({ theme: 'light', mounted: true });

      // Set to dark
      state = themeReducer(state, setTheme('dark'));
      expect(state).toEqual({ theme: 'dark', mounted: true });

      // Toggle to light
      state = themeReducer(state, toggleTheme());
      expect(state).toEqual({ theme: 'light', mounted: true });
    });

    it('should maintain state immutability', () => {
      const state = initialState;
      const newState = themeReducer(state, setTheme('dark'));

      // Original state should not be modified
      expect(state.theme).toBe('light');
      expect(newState.theme).toBe('dark');
    });
  });
});
