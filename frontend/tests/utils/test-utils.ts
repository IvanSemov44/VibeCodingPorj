import { waitFor } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';
import type { RootState } from '@/store';

/**
 * Wait for a query to be successful
 */
export async function waitForQuerySuccess(queryClient: QueryClient, queryKey: unknown[]) {
  await waitFor(() => {
    const query = queryClient.getQueryState(queryKey);
    if (!query || query.status !== 'success') {
      throw new Error('Query not successful yet');
    }
  });
}

/**
 * Wait for a query to error
 */
export async function waitForQueryError(queryClient: QueryClient, queryKey: unknown[]) {
  await waitFor(() => {
    const query = queryClient.getQueryState(queryKey);
    if (!query || query.status !== 'error') {
      throw new Error('Query not errored yet');
    }
  });
}

/**
 * Wait for a mutation to be successful
 */
export async function waitForMutationSuccess(queryClient: QueryClient, mutationKey: unknown[]) {
  await waitFor(() => {
    const mutation = queryClient
      .getMutationCache()
      .getAll()
      .find((m) => JSON.stringify(m.options.mutationKey) === JSON.stringify(mutationKey));

    if (!mutation || mutation.state.status !== 'success') {
      throw new Error('Mutation not successful yet');
    }
  });
}

/**
 * Get query data from the cache
 */
export function getQueryData<T = unknown>(queryClient: QueryClient, queryKey: unknown[]): T | undefined {
  return queryClient.getQueryData<T>(queryKey);
}

/**
 * Set query data in the cache
 */
export function setQueryData<T = unknown>(queryClient: QueryClient, queryKey: unknown[], data: T) {
  queryClient.setQueryData<T>(queryKey, data);
}

/**
 * Invalidate queries
 */
export async function invalidateQueries(queryClient: QueryClient, queryKey: unknown[]) {
  await queryClient.invalidateQueries({ queryKey });
}

/**
 * Clear all queries
 */
export function clearAllQueries(queryClient: QueryClient) {
  queryClient.clear();
}

/**
 * Create mock user for testing
 */
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    roles: ['user'],
    ...overrides,
  };
}

/**
 * Create mock admin user for testing
 */
export function createMockAdminUser(overrides = {}) {
  return {
    id: 10,
    name: 'Admin User',
    email: 'admin@example.com',
    roles: ['admin', 'user'],
    ...overrides,
  };
}

/**
 * Create initial Redux state for testing
 */
export function createInitialState(overrides: Partial<RootState> = {}): Partial<RootState> {
  return {
    theme: {
      theme: 'light',
    },
    toast: {
      toasts: [],
    },
    ...overrides,
  };
}

/**
 * Simulate delay for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock localStorage for tests
 */
export function createMockStorage() {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
}

/**
 * Setup localStorage mock
 */
export function setupLocalStorageMock() {
  const mockStorage = createMockStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });
  return mockStorage;
}

/**
 * Cleanup localStorage mock
 */
export function cleanupLocalStorageMock() {
  window.localStorage.clear();
}
