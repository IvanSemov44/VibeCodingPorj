import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

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
      '*.config.cjs'
    ],
  },

  // Extend Next.js configs
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Test file overrides - allow more flexibility in tests
  {
    files: [
      '**/__tests__/**',
      '**/*.{test,spec}.{ts,tsx,js,jsx}',
      '**/*.test.*',
      '**/*.spec.*',
      '**/*.extra.test.*',
      '**/tests/**',
      '**/test-*.ts'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },

  // Allow scripts/ to use CommonJS style requires (CLI/helper scripts)
  {
    files: ['scripts/**', 'scripts/*.*'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
];

export default eslintConfig;
