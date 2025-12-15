// test setup: jest-dom + MSW server lifecycle
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { server } from './mockServer';

// Provide a global React variable for tests that expect the classic JSX runtime
import * as React from 'react';
(globalThis as unknown as { React?: typeof React }).React = React;

// Dedicated DOM root for tests to avoid leaking global event listeners
beforeEach(() => {
  const root = document.createElement('div');
  root.setAttribute('data-test-root', 'true');
  document.body.appendChild(root);
});

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  // restore mocks before cleanup so any cleanup logic that depends on mocks/spies
  // sees the restored behavior (e.g., mocked globals used by cleanup helpers)
  // Restore mocks when available
  if (typeof vi !== 'undefined') vi.restoreAllMocks?.();
  // cleanup DOM changes and restore DOM-related state
  cleanup();
  const root = document.querySelector('[data-test-root]');
  if (root && root.parentNode) root.parentNode.removeChild(root);
});
afterAll(() => server.close());
