import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import { fireEvent } from '@testing-library/react';
import XPSlider from '../../components/journal/components/XPSlider';
import { describe, test, vi, expect } from 'vitest';

describe('XPSlider', () => {
  test('renders and changes value', async () => {
    const onChange = vi.fn();
    renderWithProviders(<XPSlider value={10} onChange={onChange} />);
    const input = screen.getByRole('slider') as HTMLInputElement;
    expect(input.value).toBe('10');
    // range inputs: fire change event to simulate sliding
    fireEvent.change(input, { target: { value: '20' } });
    expect(onChange).toHaveBeenCalled();
  });
});
