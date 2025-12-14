Frontend testing guide

- Run tests (dev):

```bash
npm run test:watch
```

- Run tests (CI):

```bash
npm run test:ci
# or
npm run test:coverage
```

- Coverage provider: `@vitest/coverage-v8` (configured in `vitest.config.ts` as `provider: 'v8'`).

- Useful helpers:

  - `tests/test-utils.tsx` — `renderWithProviders(ui, {store, queryClient})`, `createQueryClientForTest()`
  - `tests/test-store.ts` — factory for test redux stores
  - `tests/mockServer.ts` & `tests/msw/*` — MSW handlers and setup

- Best practices (quick):

  - Create a fresh `QueryClient` (disable retries) and a fresh Redux store per test.
  - Use MSW for network interactions and start the server in test setup.
  - Prefer `findBy*` / `waitFor` for async assertions.
  - Wrap interactions that trigger state in `act(...)` when necessary.
  - For ErrorBoundary tests, prefer unmount+remount to simulate recovery.

- Adding tests:

  - Unit tests go in `__tests__` next to components or under `__tests__/lib` for utilities.
  - Use `vi.fn()` for mocks and `importOriginal()` for partial mocks when needed.

- CI:

  - Ensure `npm ci` and `npm run test:coverage` are run in CI; install `@vitest/coverage-v8` as a devDependency.

- Security:
  - Run Snyk scans for new or modified code before merging.
