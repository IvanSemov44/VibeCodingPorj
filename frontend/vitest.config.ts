import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    globals: true,
    watch: false,
    coverage: {
      reporter: ['text', 'lcov'],
      // Enforce coverage thresholds — adjust as you increase test surface
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      }
    }
  }
});
