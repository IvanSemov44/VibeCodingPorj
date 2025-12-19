import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '@/store/themeSlice';
import toastReducer from '@/store/toastSlice';
import type { RootState } from '@/store';

// Create test query client with better defaults for testing
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

// Create test store with optional preloaded state
export function createTestStore(preloadedState: Partial<RootState> = {}) {
  return configureStore({
    reducer: {
      theme: themeReducer,
      toast: toastReducer,
    },
    preloadedState: preloadedState as RootState,
  });
}

// All providers wrapper
interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  store?: ReturnType<typeof createTestStore>;
}

function AllProviders({ children, queryClient, store }: AllProvidersProps) {
  const testQueryClient = queryClient || createTestQueryClient();
  const testStore = store || createTestStore();

  return (
    <Provider store={testStore}>
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}

// Custom render with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  store?: ReturnType<typeof createTestStore>;
  preloadedState?: Partial<RootState>;
}

export const customRender = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const { queryClient, store, preloadedState, ...renderOptions } = options;

  const testStore = store || createTestStore(preloadedState);
  const testQueryClient = queryClient || createTestQueryClient();

  return {
    ...render(ui, {
      wrapper: ({ children }) => (
        <AllProviders queryClient={testQueryClient} store={testStore}>
          {children}
        </AllProviders>
      ),
      ...renderOptions,
    }),
    store: testStore,
    queryClient: testQueryClient,
  };
};

// Create wrapper for hooks testing
export function createWrapper(options: {
  queryClient?: QueryClient;
  store?: ReturnType<typeof createTestStore>;
  preloadedState?: Partial<RootState>;
} = {}) {
  const { queryClient, store, preloadedState } = options;
  const testStore = store || createTestStore(preloadedState);
  const testQueryClient = queryClient || createTestQueryClient();

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AllProviders queryClient={testQueryClient} store={testStore}>
        {children}
      </AllProviders>
    );
  };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render with our custom render
export { customRender as render };
