import { configureStore } from '@reduxjs/toolkit';

/**
 * Create a test store with optional reducers and preloadedState.
 * Tests can pass a reducers map to exercise slices during integration tests.
 */
export function createTestStore(reducers: Record<string, any> = {}, preloadedState?: any) {
  return configureStore({
    // keep this flexible for tests; cast to any to satisfy configureStore signature
    reducer: reducers as any,
    preloadedState: preloadedState as any,
  }) as any;
}

export type TestStore = ReturnType<typeof createTestStore>;
