/// <reference types="vitest/globals" />

import type { TestAPI, ExpectStatic, Vi } from 'vitest';

declare global {
  const describe: TestAPI;
  const it: TestAPI;
  const test: TestAPI;
  const expect: ExpectStatic;
  const vi: Vi;
  const beforeEach: (fn: () => void | Promise<void>) => void;
  const afterEach: (fn: () => void | Promise<void>) => void;
  const beforeAll: (fn: () => void | Promise<void>) => void;
  const afterAll: (fn: () => void | Promise<void>) => void;
}
