/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  setupFilesAfterEnv: ['./jest.setup.ts', './tests/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest'
  }
};
