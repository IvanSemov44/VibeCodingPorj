/// <reference types="vitest" />
// Vitest/Jest DOM setup: ensure globals are available and reset between tests
import '@testing-library/jest-dom';

// Some test runners provide `beforeEach` as a global; guard at runtime so
// TypeScript does not require the test-global typings to be present.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((globalThis as any).beforeEach) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).beforeEach(() => {
    // reset any mocks via Vitest global `vi` if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).vi?.resetAllMocks?.();
  });
}
