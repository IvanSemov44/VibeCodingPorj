import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../test-utils';
import { fireEvent } from '@testing-library/react';
import XPSlider from '../../components/journal/components/XPSlider';

describe('XPSlider', () => {
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

  it('renders value and calls onChange when moved', async () => {
    const onChange = vi.fn();
    renderWithProviders(<XPSlider value={10} onChange={onChange} />);

    expect(screen.getByText('10')).toBeTruthy();
    const input = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '20' } });
    // onChange should be called
    expect(onChange).toHaveBeenCalled();
  });
});
