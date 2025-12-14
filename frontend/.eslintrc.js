module.exports = {
  extends: ['next', 'prettier'],
  ignorePatterns: ['.next/', 'node_modules/'],
  rules: {},
  overrides: [
    {
      // Broad test file globs (including `.extra.test.tsx` files)
      files: [
        '**/__tests__/**',
        '**/*.{test,spec}.{ts,tsx,js,jsx}',
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.extra.test.*'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off'
      }
    }
  ]
};
