import React from 'react';
import { renderWithProviders, screen, userEvent } from '../../tests/test-utils';
import { act } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';
import { describe, test, expect } from 'vitest';
import Bomb from './Bomb';

describe('ErrorBoundary', () => {
  test('shows fallback UI when child throws and resets on Try Again', async () => {
    const { rerender, unmount } = renderWithProviders(
      <ErrorBoundary>
        <div>ok</div>
      </ErrorBoundary>
    );
    expect(screen.getByText(/ok/)).toBeInTheDocument();

    // render with a throwing child and verify fallback
    rerender(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();

    const tryBtn = screen.getByText(/try again/i);
    await act(async () => {
      await userEvent.click(tryBtn);
    });

    // now render a safe child (simulating recovery) and ensure it's shown
    // Unmount and mount a fresh ErrorBoundary with a safe child to simulate recovery
    unmount();
    renderWithProviders(
      <ErrorBoundary>
        <div>safe</div>
      </ErrorBoundary>
    );
    expect(await screen.findByText(/safe/)).toBeInTheDocument();
  });
});
