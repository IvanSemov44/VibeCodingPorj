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
        cacheTime: 0,
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
  const usedStore = options?.store || (defaultStore as Store);

  function Wrapper({ children }: { children?: React.ReactNode }) {
    return (
      <Provider store={usedStore}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper }), queryClient, store: usedStore };
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
