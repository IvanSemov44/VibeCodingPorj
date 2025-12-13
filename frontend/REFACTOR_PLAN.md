# Frontend Refactor & Hardening Plan

Last updated: 2025-12-10

Goal: Incrementally make the Next.js frontend strongly-typed, lint/CI-protected, and easier to maintain while keeping changes low-risk and fully tested.

Summary

- Centralize domain types and API boundaries.
- Harden runtime parsing for API responses.
- Fully type and test common hooks (`useForm`, `useAsync`).
- Remove remaining `any` usages and reduce lint warnings to zero.
- Add CI (lint, typecheck, tests, Snyk) and a PR gating policy.

Prioritized Roadmap

1. Project housekeeping (low risk)

   - Add this REFACTOR_PLAN.md to repo (done).
   - Ensure `tsconfig.json` and `eslintrc` are set to strict rules.
   - Add `npm` scripts (lint/typecheck/test) to `package.json` if missing.

2. Types & API boundary (high impact)

   - Keep/expand `frontend/lib/types.ts` as the single source of truth.
   - Ensure all API functions in `frontend/lib/api.ts` return typed payloads (not `Response`).
   - Add lightweight runtime checks for critical endpoints (zod or small guards).

3. Hooks & utilities (medium effort)

   - Fully generic `useForm<T>` and `useAsync<T>` with unit tests.
   - Add `useDebounce` and `useAuth` typings where needed.

4. Components & pages (incremental)

   - Convert remaining JS files to `.ts`/`.tsx` as needed.
   - Replace `<img>` with `next/image` for LCP-sensitive images; update `next.config.js` `images.domains`.
   - Fix remaining lint warnings and accessibility issues.

5. Tests & CI (critical)

   - Add unit tests for `lib/api.ts`, key components, and hooks.
   - Add GitHub Actions workflow: install, lint, typecheck, test, Snyk scan.
   - Protect `master` branch requiring passing CI.

6. Performance & accessibility

   - Add bundle analysis and a11y checks (axe CI or lighthouse spot checks).

7. Documentation & DX
   - `frontend/README.md` with setup and common commands.
   - `CONTRIBUTING.md` with PR checklist, commit style, and runbook for failures.

Concrete First Tasks (this sprint)

- Create `frontend/.github/workflows/ci.yml` (CI for lint/type/test/snyk).
- Add runtime validation for `getTool` and `createTool` responses (zod schemas, minimal for now).
- Add unit tests for `useForm` and `useAsync`.

Commands you can run locally

```
# install deps
npm ci

# lint, typecheck, tests
npm run lint
npm run typecheck
npm test

# build (validate Next build)
npm run build
```

Example GitHub Actions (CI) snippet (starter)

```yaml
name: frontend-ci
on: [push, pull_request]
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Typecheck
        run: npm run typecheck
      - name: Test
        run: npm test --silent
      - name: Snyk (optional)
        uses: snyk/actions@master
        with:
          command: test
```

Notes and rationale

- Use `unknown` not `any` at API boundaries; convert to typed payloads as close to the fetch boundary as possible.
- Add small runtime checks (zod) for the most important endpoints (auth, tools). Don't schema-everything immediately; prioritize high-risk endpoints.
- Keep changes small: commit many small PRs rather than a single huge migration.

If you want, I'll start by creating the CI workflow and adding zod to `devDependencies` and wiring up a basic schema for `Tool` and `AuthResponse`.

---

Path: `frontend/REFACTOR_PLAN.md`
