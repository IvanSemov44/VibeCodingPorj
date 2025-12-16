# Frontend Best Practices & Recommendations — 2025

Date: 2025-12-16

## Summary

This document summarizes a concise frontend review of the repository and provides prioritized, actionable recommendations for 2025 best practices. It covers configuration, tooling, API patterns, testing, accessibility, performance, and maintainability with concrete next steps and quick wins.

## Key Positives

- Strong TypeScript usage with `strict` enabled and modern compiler options.
- Good test setup: Vitest, MSW, and axe accessibility tooling are present.
- Tailwind + CSS variables provide consistent theming.
- Clear separation of concerns: `lib/api` for API, `store/domains` for domain hooks, React Query for data fetching.
- Pre-commit checks: Husky + lint-staged + Prettier + ESLint.

## High-priority Recommendations

1. API typing & runtime validation

   - Add runtime validators (Zod) for all API responses and wire them into `parseJson` or per-endpoint wrappers. This prevents silent breakage when backend shapes change.
   - Replace ad-hoc `any` shapes with typed DTOs and return generics from API helper functions.

2. Robust fetch handling

   - Add AbortController/timeouts to `lib/api/fetch.ts` and expose a `fetchWithAuth<T>` that supports cancellations during unmounts and long requests.
   - Classify errors (network, timeout, 401, 403, validation) and ensure `handleApiError` returns typed error objects the UI can react against.

3. CSRF & cookie handling

   - Consider migrating `getCookie` to a well-tested helper (e.g., `js-cookie`) to avoid regex edge-cases and ensure correct decoding.
   - Confirm server `SameSite` and `Secure` cookie flags for production.

4. Project paths & layout

   - The `tsconfig` `paths` maps to `src/*` but the project root is `frontend/`. Either move sources into `src/` or remove the alias to avoid confusion. Using `src/` is recommended by the Next community.

5. Next.js & App Router strategy

   - You're on Next 15 Pages Router. Evaluate an incremental App Router migration for server components and streaming where it improves UX (not urgent but strategic).

6. Testing & CI

   - Add a CI job that runs `npm run check` for the frontend (typecheck + lint + format check + tests). Gate merges on these checks.
   - Raise coverage thresholds incrementally and add Playwright smoke tests for critical user flows (login, create tool, admin delete).

7. Accessibility
   - Add axe checks in CI (as a separate job or gating rule) and ensure interactive components provide keyboard affordances, `aria-*` attributes, and visible focus states.

## Medium-priority Recommendations

- Centralize UI tokens and enforce `Button`, `Card`, `Badge` usage for consistent spacing and theming.
- Create component barrels (`components/index.ts`) for simpler imports and easier refactors.
- Use dynamic imports for rarely used heavy components (e.g., Tag editor) to reduce initial bundle.
- Consider migrating forms from Formik → React Hook Form + Zod for smaller bundles and better performance.

## Low-priority / Aspirational

- Adopt App Router + React Server Components selectively when SSR + streaming provide benefit.
- Evaluate bundler choices only if you need non-standard optimizations; Next handles most cases.

## Repo-specific Actionable Items (concrete)

- `lib/api/fetch.ts`

  - Add AbortController support and request timeouts.
  - Add generic `fetchWithAuth<T>` and a `parseAndValidate<T>(res, schema)` helper using Zod.

- `lib/api/index.ts`

  - Remove the unused `apiDefault` export or document why it exists.

- `store/api2.ts`

  - Keep as migration shim but add a removal plan and deprecation date in `REFACTOR-STORE.md`.

- `tsconfig.json`

  - Either adopt `src/` layout or remove the `paths` alias. Prefer `src/` for clarity.

- Tests/CI
  - Add a GitHub Actions (or your CI) workflow that runs `npm ci && npm run check` in `frontend` and uploads coverage/axe reports as artifacts.

## Quick Wins (I can implement now)

1. Add AbortController + timeout wrapper to `lib/api/fetch.ts`.
2. Add a Zod runtime validator helper and wire it into a single endpoint as example.
3. Create CI YAML to run `npm run check` and upload reports.

## TagMultiSelect (component-specific plan)

The `TagMultiSelect` component already has a detailed implementation plan in `TAGMULTISELECT-IMPROVEMENTS.md`. Prioritize:

- Fix keyboard navigation to reach the Create option.
- Memoize expensive computations (`useMemo`) and stabilize handlers (`useCallback`).
- Skip API fetch when external options are provided.
- Add validation, ARIA improvements, `useId()`, and loading states.
- Re-enable and fix tests (use `user-event`, mock MSW properly, add `waitFor`).

## Next steps

1. Pick a quick-win for me to implement: AbortController in `fetch`, Zod validation helper, or CI workflow.
2. I can implement the chosen quick-win and run frontend checks/tests.

## References

- React docs: https://react.dev
- Zod: https://github.com/colinhacks/zod
- ARIA combobox pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
- Vitest & MSW docs

--
Generated by automated repo review on 2025-12-16
