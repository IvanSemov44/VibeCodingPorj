import React from 'react';
import { vi, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { server } from './mockServer';
// Global mocks (e.g. next/image) for jsdom tests — use tests/mocks
import './mocks/next-image';

// Make React available globally for tests
(globalThis as unknown as { React?: typeof React }).React = React;

// Suppress React error logging during tests to prevent stderr noise in CI
const originalError = console.error;
console.error = (...args: any[]) => {
  const firstArg = args[0];
  const msg = String(firstArg || '');

  // Suppress Error instances with 'boom' message (test component throws)
  if (firstArg instanceof Error && firstArg.message === 'boom') {
    return;
  }

  // Suppress React error boundary messages
  if (
    msg.includes('The above error occurred') ||
    msg.includes('React will try to recreate') ||
    msg.includes('Error caught by')
  ) {
    return;
  }

  originalError(...args);
};

// MSW server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Global test cleanup
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  server.resetHandlers();
});

afterAll(() => server.close());
