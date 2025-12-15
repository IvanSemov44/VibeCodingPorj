import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    globals: true,
    watch: false,
    // Ensure both top-level `tests/` and colocated `tests/` are discovered
    include: ['tests/**/*.{test,spec}.{js,ts,tsx}', '__tests__/**/*.{test,spec}.{js,ts,tsx}'],
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Include only the source files we are testing now so we can incrementally reach 100%
      include: [
        'components/**/*.{ts,tsx}',
        'components/journal/**/*.{ts,tsx}',
        'components/journal/components/**/*.{ts,tsx}',
        'hooks/useAsync.{ts,tsx}',
        'hooks/useJournal.{ts,tsx}',
        'lib/utils.{ts,tsx}',
        'lib/classNames.{ts,tsx}',
        'lib/errors.{ts,tsx}',
        'context/ThemeContext.{ts,tsx}',
        'store/journalSlice.{ts,tsx}',
        'pages/login.{ts,tsx}',
      ],
      // Exclude tests, type decls, build and public assets
      exclude: ['**/*.config.*', '**/*.d.ts', 'public/**', 'styles/**', 'node_modules/**'],
      // Coverage thresholds — relaxed to allow incremental improvements
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
      },
    },
  },
});
