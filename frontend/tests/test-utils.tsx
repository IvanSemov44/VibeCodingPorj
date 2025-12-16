import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store as defaultStore } from '../store';
import type { Store } from '@reduxjs/toolkit';

export function createQueryClientForTest() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchInterval: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: { store?: Store; queryClient?: QueryClient },
) {
  const queryClient = options?.queryClient || createQueryClientForTest();
  // register queryClient for cleanup in global test teardown
  const g = global as unknown as { __TEST_QUERY_CLIENTS?: QueryClient[] };
  if (!g.__TEST_QUERY_CLIENTS) g.__TEST_QUERY_CLIENTS = [];
  g.__TEST_QUERY_CLIENTS.push(queryClient);
  const usedStore = options?.store || (defaultStore as Store);

  function Wrapper({ children }: { children?: React.ReactNode }) {
    return (
      <Provider store={usedStore}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  }

  // prefer the dedicated test root container when present to avoid leaking global event listeners
  // and to make cleanup predictable across tests
  const testRoot = document.querySelector('[data-test-root]') as HTMLElement | null;
  let mountNode: HTMLElement | undefined = undefined;
  if (testRoot) {
    mountNode = document.createElement('div');
    testRoot.appendChild(mountNode);
  }
  const result = {
    ...render(ui, { wrapper: Wrapper, container: mountNode }),
    queryClient,
    store: usedStore,
  };
  return result;
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
