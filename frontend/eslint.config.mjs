import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import importPlugin from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Global ignores - completely exclude these from linting
  {
    ignores: [
      '.next/**',
      '.next/',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      '*.config.cjs',
    ],
  },

  // Extend Next.js configs
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // import plugin to detect unresolved imports
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      'import/no-unresolved': 'error',
    },
  },

  // Test file overrides - allow more flexibility in tests
  {
    files: [
      '**/tests/**',
      '**/*.{test,spec}.{ts,tsx,js,jsx}',
      '**/*.test.*',
      '**/*.spec.*',
      '**/*.extra.test.*',
      '**/tests/**',
      '**/test-*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Allow scripts/ to use CommonJS style requires (CLI/helper scripts)
  {
    files: ['scripts/**', 'scripts/*.*'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Allow any in API/admin handlers where response shapes are dynamic
  {
    files: [
      'lib/api/**',
      'store/domains/**',
      'pages/admin/**',
      'components/admin/**',
      'middleware.ts',
      'pages/tools/**',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // Downgrade to warning for complex types
    },
  },
];

export default eslintConfig;
