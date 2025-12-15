import reducer, { setTheme, toggleTheme, initializeTheme } from '../../store/themeSlice';

describe('themeSlice reducers', () => {
  it('setTheme sets the theme', () => {
    const state = reducer(undefined, setTheme('dark'));
    expect(state.theme).toBe('dark');
  });

  it('toggleTheme flips the theme', () => {
    const initial = { theme: 'light', mounted: false } as any;
    const state = reducer(initial, toggleTheme());
    expect(state.theme).toBe('dark');
  });

  it('initializeTheme marks mounted', () => {
    const state = reducer(undefined, initializeTheme());
    expect(state.mounted).toBe(true);
  });
});
