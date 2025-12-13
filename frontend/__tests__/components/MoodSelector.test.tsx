import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import MoodSelector from '../../components/journal/components/MoodSelector';
import { describe, test, vi, expect } from 'vitest';

describe('MoodSelector', () => {
  test('renders options and calls onChange', async () => {
    const onChange = vi.fn();
    renderWithProviders(<MoodSelector value="neutral" onChange={onChange} />);

    const btn = screen
      .getAllByRole('button')
      .find((b) => /😊|🚀|😐|😴|🏆/.test(b.textContent || ''));
    if (btn) await userEvent.click(btn);
    expect(onChange).toHaveBeenCalled();
  });
});
