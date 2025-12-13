import React, { JSX } from 'react';
import { renderWithProviders, screen } from '../../tests/test-utils';
import LoadingSpinner, { LoadingPage } from '../../components/Loading';
import { describe, test, expect } from 'vitest';

describe('Loading components', () => {
  test('LoadingSpinner renders with given size', () => {
    const { container } = renderWithProviders(
      (<LoadingSpinner size="sm" />) as unknown as JSX.Element,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.className).toContain('w-4');
  });

  test('LoadingSpinner applies inline color style when provided', () => {
    const { container } = renderWithProviders(
      (<LoadingSpinner size="md" color="#123456" />) as unknown as JSX.Element,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.borderTopColor || el.style.borderColor).toBeTruthy();
  });

  test('LoadingPage shows message', () => {
    renderWithProviders(<LoadingPage message="Please wait" />);
    expect(screen.getByText(/please wait/i)).toBeInTheDocument();
  });
});
