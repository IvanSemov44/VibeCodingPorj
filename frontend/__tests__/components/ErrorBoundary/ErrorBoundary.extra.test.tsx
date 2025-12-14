import React from 'react';
import { renderWithProviders, screen } from '../../../tests/test-utils';
import ErrorBoundary from '../../../components/ErrorBoundary';
import { describe, test, vi, expect } from 'vitest';
import Bomb from '../Bomb';

describe('ErrorBoundary extra coverage', () => {
  test('uses custom fallback when provided and calls onError', async () => {
    const onError = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWithProviders(
      <ErrorBoundary fallback={<div>custom fallback</div>} onError={onError}>
        <Bomb explode />
      </ErrorBoundary>,
    );

    expect(await screen.findByText(/custom fallback/i)).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('shows development error details when NODE_ENV=development', async () => {
    const prev = (process as any).env.NODE_ENV;
    (process as any).env.NODE_ENV = 'development';
    try {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      renderWithProviders(
        <ErrorBoundary>
          <Bomb explode />
        </ErrorBoundary>,
      );

      expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
      expect(await screen.findByText(/Error Details/i)).toBeInTheDocument();
      consoleSpy.mockRestore();
    } finally {
      (process as any).env.NODE_ENV = prev;
    }
  });
});
