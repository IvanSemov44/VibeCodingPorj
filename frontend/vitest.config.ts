import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    globals: true,
    watch: false,
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
        'pages/login.{ts,tsx}'
      ],
      // Exclude tests, type decls, build and public assets
      exclude: ['**/*.config.*', '**/*.d.ts', 'public/**', 'styles/**', '**/__tests__/**', 'node_modules/**'],
      // Strict thresholds for the included set — adjust if needed during ramp-up
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      }
    }
  }
});
