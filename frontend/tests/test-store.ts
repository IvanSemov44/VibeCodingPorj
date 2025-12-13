import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';

/**
 * Create a test store with optional reducers and preloadedState.
 * Tests can pass a reducers map to exercise slices during integration tests.
 */
export function createTestStore(reducers: Record<string, any> = {}, preloadedState?: PreloadedState<Record<string, unknown>>) {
  return configureStore({
    reducer: reducers,
    preloadedState,
  });
}

export type TestStore = ReturnType<typeof createTestStore>;
