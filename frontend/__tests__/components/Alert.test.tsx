import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import Alert from '../../components/Alert';
import { describe, expect, test, vi } from 'vitest';

describe('Alert component', () => {
  test('renders message and icon for each type', () => {
    const { rerender } = renderWithProviders(<Alert type="success" message="OK" />);
    expect(screen.getByText(/ok/i)).toBeInTheDocument();

    rerender(<Alert type="error" message="Bad" />);
    expect(screen.getByText(/bad/i)).toBeInTheDocument();
  });

  test('calls onClose when close button provided', async () => {
    const onClose = vi.fn();
    renderWithProviders(<Alert message="Dismiss" onClose={onClose} />);

    const btn = screen.getByRole('button');
    await userEvent.click(btn);
    expect(onClose).toHaveBeenCalled();
  });
});
