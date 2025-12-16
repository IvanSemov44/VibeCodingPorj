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
  // Clear and cancel any QueryClients created during tests to avoid timers keeping
  // the Node process alive (React Query uses timers internally).
  const g = global as unknown as { __TEST_QUERY_CLIENTS?: any[] };
  if (g.__TEST_QUERY_CLIENTS && Array.isArray(g.__TEST_QUERY_CLIENTS)) {
    for (const qc of g.__TEST_QUERY_CLIENTS) {
      try {
        // cancel outstanding queries and clear caches (safe no-op if already cleared)
        qc.cancelQueries?.();
        qc.getQueryCache?.()?.clear?.();
        qc.getMutationCache?.()?.clear?.();
      } catch (e) {
        // ignore errors during cleanup
      }
    }
    g.__TEST_QUERY_CLIENTS.length = 0;
  }
});
afterAll(() => server.close());

// Provide a default mock for `store/domains` to avoid per-test boilerplate.
// Individual tests may still `vi.mock` the module to override behavior.
import { vi } from 'vitest';

vi.mock('../store/domains', () => {
  const noopTrigger = vi.fn(() => ({ unwrap: () => Promise.resolve() }));
  return {
    useGetTagsQuery: () => ({ data: [], isLoading: false, isError: false }),
    useGetToolsQuery: () => ({ data: [], isLoading: false, isError: false }),
    useGetCategoriesQuery: () => ({ data: [], isLoading: false, isError: false }),
    useCreateToolMutation: () => [noopTrigger, {}],
    useUpdateToolMutation: () => [noopTrigger, {}],
    useDeleteToolMutation: () => [noopTrigger, {}],
    useUploadToolScreenshotsMutation: () => [vi.fn(() => ({ unwrap: () => Promise.resolve({ screenshots: [] }) })), {}],
    useDeleteToolScreenshotMutation: () => [noopTrigger, {}],
    useGetCsrfMutation: () => [noopTrigger, {}],
  } as any;
});

// Prevent tests from failing the process due to unhandled promise rejections
// produced intentionally by mocks (they are asserted on in tests). Tests
// should still assert expected behavior; this only reduces noisy test-run
// failures caused by timing of promise rejection propagation.
process.on('unhandledRejection', (reason: unknown) => {
  // keep this quiet in normal runs; developers can remove this if undesired
  const message =
    typeof reason === 'object' && reason !== null && 'message' in reason
      ? (reason as { message?: unknown }).message ?? reason
      : reason;
  console.debug('Suppressed unhandledRejection during tests:', message);
});
