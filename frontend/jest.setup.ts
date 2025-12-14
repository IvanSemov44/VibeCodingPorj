// Jest setup: ensure globals are available and reset between tests
import '@testing-library/jest-dom';

beforeEach(() => {
  // reset any mocks
  jest.resetAllMocks();
});
