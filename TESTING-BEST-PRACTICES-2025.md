TESTING BEST PRACTICES — 2025

Purpose
- Focused, actionable guidance for writing and running reliable tests in modern JS/TS + full-stack projects (local, CI, containers).
- Keep this file near the repo root; tell me to “apply TESTING-BEST-PRACTICES-2025” and I will use it when creating or reviewing tests.

Principles
- Fast, Deterministic, Isolated: prefer unit tests that run quickly and never depend on external services. Integration/E2E tests are slower and should be targeted.
- Reproducibility: tests must pass locally, in CI, and in reproducible build containers.
- Observability: test failures must show useful signals (logs, snapshots, traces) to fix quickly.

Test Types & Scope
- Unit: small functions, reducers, hooks. Mock external I/O.
- Integration: interaction between modules (DB layer in-memory or Dockerized test DB, real HTTP via MSW with recorded fixtures).
- E2E: critical user flows only (login, checkout, key onboarding). Run fewer and run them in CI with isolation.
- Contract Tests: provider/consumer contracts for APIs (Pact or contract test suites) to avoid brittle E2E.

Test Environment & CI
- Use the same Node + deps in CI and local; pin versions in `engines` or use `.nvmrc`/devcontainer.
- Use containers (Docker) in CI to emulate environment where necessary (e.g., DB, caches).
- CI pipeline order: install -> lint -> typecheck -> unit tests (fast) -> integration (parallel where safe) -> E2E (gated, run on main/daily).
- Run critical tests on PRs; schedule full suite nightly with coverage and flaky-test detection.

Test Architecture & Patterns
- Deterministic data: factories and seeded fixtures; avoid clocks, randomness — when used, always inject providers/mocks and freeze time in tests.
- Isolation: mount UI tests into a dedicated `data-test-root` container and call cleanup after each test to prevent leaking global event listeners.
- Idempotent tests: each test should create and clean up its own resources (DB rows, files, DOM nodes).
- Avoid network in unit tests: use MSW for HTTP mocking and record fixtures for integration.

Mocking Strategy
- Prefer lightweight mocks: `vi.mock` / Jest mocks for specific modules, MSW for HTTP.
- For third-party SDKs, prefer interface adapters in code so tests can swap implementations easily.
- Where partial mocks are needed, use `importOriginal`/partial mocking to keep critical exports (e.g., QueryClient from react-query).

Flakiness & Stability
- Use `afterEach(cleanup)` and isolation techniques to remove event listeners and timers.
- Detect flaky tests: track flaky runs, mark with `.skip` only as triage (not permanent), and create tickets to fix.
- Increase timeout only as last resort; prefer fixing root cause (race conditions, event leaks).

Performance & Parallelism
- Parallelize safely: group tests by isolation needs. Keep unit tests parallel; run E2E serially or in dedicated runners.
- Use test sharding in CI for large suites and cache node_modules and build artifacts.

Coverage & Quality Gates
- Enforce coverage thresholds for critical modules (statements/branches/functions/lines). Start low and raise gradually.
- Prefer focused tests that cover behavior and branches rather than solely line coverage.

Type Safety & Contracts
- Use TypeScript + typed test fixtures. Use Zod or runtime schemas to validate external inputs in integration tests.
- Where contracts exist, automate contract verification in CI.

Security & Secrets in Tests
- Never store production secrets in tests; use CI secret stores and short-lived tokens for integration tests.
- For recorded fixtures (http), scrub PII and secrets before committing.

E2E & Browser Tests
- Use Playwright (recommended) or Cypress for cross-browser E2E. Run headless in CI and optionally headed in debug runs.
- Run critical E2E on protected branches or nightly; keep them small and resilient to timing.

Local Developer Experience
- Provide npm scripts: `npm run test`, `npm run test:watch`, `npm run test:e2e` with consistent behavior.
- Offer a lightweight seeded dev DB and scripts to run integration tests locally (docker-compose/test containers).
- Documentation: include `tests/README.md` with how to run tests, common failures, and how to reproduce CI failures.

Observability for Failures
- Emit structured logs for failing tests; capture screenshots/video for E2E failures and retain artifacts for a set retention period.
- Use test reporters that integrate with CI (GH checks, JUnit xml) so failures surface in PRs.

Maintainability
- Keep tests close to code (colocated) for unit tests; integration/E2E in `tests/`.
- Review tests in PRs — tests are first-class code and should be reviewed with same rigor.

AI / LLM-assisted Test Generation
- Use LLMs to propose tests, but always review generated tests and ensure they follow team patterns and don't leak secrets.
- Use LLMs for test scaffolding (boilerplate) and augmentation, but require human validation for coverage and assertions.

Checklist for Adding a New Test
- Purpose: one-sentence why the test exists.
- Type: unit/integration/E2E/contract.
- Dependencies: mocks, fixtures, DB.
- Isolation: ensures no global side effects.
- CI cost: estimate runtime and frequency.

Quick Starter snippets (JS/TS)
- Use a deterministic mount (React Testing Library):
  - create a `data-test-root` in `beforeEach` and append container there; remove in `afterEach`.
- MSW for HTTP in `tests/setupTests.ts` with server lifecycle hooks.

How I will use this file
- If you ask me to "apply TESTING-BEST-PRACTICES-2025" I will automatically:
  - Add missing `cleanup()` and `data-test-root` patterns to tests I create.
  - Prefer MSW over real HTTP in new tests and seed fixtures properly.
  - Add CI steps or PR checks for test linting/typecheck/coverage if missing.

---
Generated: 2025-12-14
