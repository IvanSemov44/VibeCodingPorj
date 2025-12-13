import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ThemeInitializer } from '../../components/ThemeInitializer';
import { describe, beforeEach, vi, afterEach, test, expect } from 'vitest';

function Consumer() {
  const { theme, toggleTheme } = useAppTheme();
  return (
    <div>
      <span>theme:{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    // clear localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => undefined as any);
  });

  afterEach(() => {
    // restore mocks if they exist
    const getItemMock = (Storage.prototype.getItem as unknown) as { mockRestore?: () => void };
    getItemMock.mockRestore?.();
    const setItemMock = (Storage.prototype.setItem as unknown) as { mockRestore?: () => void };
    setItemMock.mockRestore?.();
  });

  test('provides theme and toggles', async () => {
    renderWithProviders(
      <ThemeInitializer>
        <Consumer />
      </ThemeInitializer>
    );

    // ThemeInitializer runs initialization on mount; wait for consumer to appear
    const el = await screen.findByText(/theme:/i);
    expect(el).toBeInTheDocument();

    const btn = screen.getByText(/toggle/i);
    await userEvent.click(btn);
    // setItem called when toggled
    expect(Storage.prototype.setItem).toHaveBeenCalled();
  });
});