import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../test-utils';

import MoodSelector from '../../components/journal/components/MoodSelector';
import { MOOD_OPTIONS } from '../../lib/constants';

describe('MoodSelector', () => {
  beforeEach(() => {
    const root = document.createElement('div');
    root.setAttribute('data-test-root', 'true');
    document.body.appendChild(root);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    const root = document.querySelector('[data-test-root]');
    root?.remove();
  });

  it('renders mood options and triggers onChange', async () => {
    const onChange = vi.fn();
    const initial = MOOD_OPTIONS[0].value;
    renderWithProviders(<MoodSelector value={initial} onChange={onChange} />);

    const other = MOOD_OPTIONS.find((m) => m.value !== initial)!;
    const btn = screen.getByText(other.label);
    await userEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(other.value);
  });
});
