import React from 'react';
import { renderWithProviders, screen } from '../../tests/test-utils';
import ErrorBoundary from '../../components/ErrorBoundary';
import { describe, test, vi, expect } from 'vitest';
import Bomb from './Bomb';

describe('ErrorBoundary extra coverage', () => {
  test('uses custom fallback when provided and calls onError', async () => {
    const onError = vi.fn();
    renderWithProviders(
      <ErrorBoundary fallback={<div>custom fallback</div>} onError={onError}>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(await screen.findByText(/custom fallback/i)).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  test('shows development error details when NODE_ENV=development', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      renderWithProviders(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>,
      );

      expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
      expect(await screen.findByText(/Error Details/i)).toBeInTheDocument();
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});
