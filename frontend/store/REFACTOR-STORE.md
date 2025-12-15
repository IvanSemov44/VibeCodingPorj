# Refactor Plan — Store Splitting and Cleanup

## Summary

This document describes a step-by-step refactor to split the large `api2.ts` file into focused domain modules under `frontend/store/domains/`, centralize query keys, provide a small helper to reduce mutation/query boilerplate, and replace the single large export file with a small barrel. The goal is better maintainability, easier testing, reduced merge conflicts, and clearer responsibilities.

## Goals

- Split monolith into domain-focused modules
- Reduce repeated boilerplate for `useQuery`/`useMutation`
- Centralize query keys to avoid string typos
- Make imports easier to manage and refactor incrementally
- Keep runtime behavior unchanged while improving developer ergonomics

## Scope

- Source: `frontend/store/api2.ts`
- Targets: create `frontend/store/domains/*`, `frontend/store/queryKeys.ts`, `frontend/store/utils/createMutation.ts`, new barrel at `frontend/store/index.ts`
- Update all imports across the codebase to point to the new small barrel

## Files to Create

- `frontend/store/domains/user.ts`
- `frontend/store/domains/entries.ts`
- `frontend/store/domains/tools.ts`
- `frontend/store/domains/tags.ts`
- `frontend/store/domains/categories.ts`
- `frontend/store/queryKeys.ts`
- `frontend/store/utils/createMutation.ts`
- `frontend/store/index.ts` (barrel)

## Detailed Steps

### Step 1 — Create `frontend/store/domains/` and move related hooks

- Move related hooks from `api2.ts` into domain files. Keep each domain file small (aim for < 300 LOC).
- Example: `frontend/store/domains/user.ts`

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../../lib/api';
import { QUERY_KEYS } from '../queryKeys';

export function useGetUserQuery(options?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEYS.USER],
    queryFn: async () => (await api.getUser()) as any,
    ...(options || {}),
  });
}

export function useLoginMutation() {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: (body: any) => api.login(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.USER] }),
  });
  const trigger = (arg: any) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}
```

- Repeat similar extraction for `entries`, `tools`, `tags`, `categories`. Import only required `lib/api` functions.

### Step 2 — Add `frontend/store/queryKeys.ts`

Centralize query keys for consistency and single source of truth.

```ts
export const QUERY_KEYS = {
  USER: 'user',
  ENTRIES: 'entries',
  STATS: 'stats',
  TOOLS: 'tools',
  TOOL: 'tool',
  TAGS: 'tags',
  CATEGORIES: 'categories',
} as const;
```

Use e.g. `[QUERY_KEYS.ENTRIES, params]` for param-aware keys.

### Step 3 — Add helper `frontend/store/utils/createMutation.ts`

Reduce repeated mutation boilerplate by wrapping `useMutation` + invalidation pattern.

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

type CreateMutationOptions<TVars, TData> = {
  fn: (vars: TVars) => Promise<TData>;
  invalidate?: Array<string | readonly unknown[]>;
};

export function createMutation<TVars, TData>({
  fn,
  invalidate,
}: CreateMutationOptions<TVars, TData>) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: fn,
    onSuccess: () => {
      if (invalidate)
        invalidate.forEach((k) => qc.invalidateQueries({ queryKey: Array.isArray(k) ? k : [k] }));
    },
  });
  return (arg: TVars) => ({ unwrap: () => m.mutateAsync(arg) });
}
```

Usage in a domain file:

```ts
const createTool = (body) => api.createTool(body);
export function useCreateToolMutation() {
  return createMutation({ fn: createTool, invalidate: [QUERY_KEYS.TOOLS] });
}
```

### Step 4 — Replace `api2.ts` with barrel `frontend/store/index.ts`

Create a small barrel that re-exports domain hooks. This preserves import paths and makes progressive migration simple.

```ts
export * from './domains/user';
export * from './domains/entries';
export * from './domains/tools';
export * from './domains/tags';
export * from './domains/categories';
export * from './queryKeys';
```

Then update imports in the app to import from `frontend/store` (the previous `api2` import points can be replaced to `store`).

### Step 5 — Run tests and update imports across the app

- Run the test suite and the typecheck/lint pipeline.
- Use codemods or search/replace to update imports from `../store/api2` to `../store` (or new domain paths if needed).

Example commands:

```bash
# run frontend checks
cd frontend
npm run typecheck
npm run lint
npm run test:ci

# replace imports (example using ripgrep + sed)
rg "from ['\"](.*)/store/api2['\"]" -l | xargs sed -i "s@/store/api2@/store@g"
```

## Migration Strategy (incremental)

- Phase 1: Create `domains/` files and the barrel. Do not remove `api2.ts` yet. Add `export * from './domains/*'` in barrel.
- Phase 2: Update selected, high-traffic, or risky imports to use the barrel. Run tests.
- Phase 3: Replace remaining imports.
- Phase 4: Remove `api2.ts` once all imports use the barrel and CI passes.

## Testing & CI

- Add or update unit tests for a sample domain (mock `lib/api` with `vi.mock`/`msw`).
- Ensure coverage does not drop for critical paths (auth, create/update flows).
- Add a CI step that runs `npm run check` for the frontend and fails if typecheck or lint fails.

## Rollback Plan

- Keep `api2.ts` until all code references are migrated; do not delete it in the first PR.
- If a regression is introduced, revert the PR or switch imports back to `api2.ts` quickly.

## Estimated Effort

- Create domain files + helpers: 1–3 hours
- Update imports (automated): 0.5–1 hour
- Tests & verification: 1–2 hours
- Total (conservative): 3–6 hours depending on size and tests

## Checklist

- [ ] Create `frontend/store/domains/` files and move hooks
- [ ] Add `frontend/store/queryKeys.ts`
- [ ] Add `frontend/store/utils/createMutation.ts`
- [ ] Create `frontend/store/index.ts` (barrel)
- [ ] Migrate imports incrementally
- [ ] Run full test suite and fix regressions
- [ ] Remove old `api2.ts` once stable

---

If you want, I can implement the first PR that moves the `user` hooks into `frontend/store/domains/user.ts`, adds `queryKeys.ts`, and introduces the `createMutation` helper to demonstrate the pattern.
