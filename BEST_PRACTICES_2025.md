# Best Practices & AI-Agent Prompts — 2025

This document captures recommended workflows, engineering best practices, and reusable AI-agent prompt templates for working on this repository in 2025. Use these recommendations to keep changes minimal, testable, and easy to review.

**Scope:** git workflow, local dev, CI/test guidance, performance caution (N+1), caching, Docker, and AI-agent prompts to safely make repo edits.

---

**Quick Principles**
- Small, focused commits. One change per PR. Prefer many small PRs over one giant PR.
- Make the smallest code change that fixes the problem. Prefer API-compatible, low-risk edits.
- Add or update tests for behavior you change. If you change DB schema, add a migration + test.
- Run tests locally (or in container) before pushing. Prefer re-running only impacted tests.
- Use the repository's existing style and conventions.

---

**Git & Branching**
- Branch from `main` for features: `feature/<short-desc>`.
- Commit messages: `type(scope): short description` e.g. `fix(tool-search): avoid N+1 in ToolController`.
- Open a PR with short description, reasoning, test details, and any manual verification steps.

---

**Local Dev & Containers**
- Use Docker Compose services: `php_fpm`, `mysql`, `redis`, `frontend`.
- Rebuild PHP image if native extensions or system libs are needed (e.g., sqlite, redis): `docker compose build php_fpm`.
- Run tests inside PHP container to match CI: 
  - `docker compose run --rm php_fpm sh -lc "cd /var/www/html && php artisan test --filter=YourTest"`

---

**Testing & CI**
- Add regression tests for N+1 or performance fixes (we already have `ToolQueryCountTest` style tests).
- Prefer deterministic, isolated tests (use `RefreshDatabase`).
- Keep tests fast; isolate expensive integration tests behind a label or separate job.

---

**Performance & N+1 Guidance**
- Always eager-load relations used in resources/controllers: add scoped eager-loads like `withRelations()` or targeted `with(['categories:id,name,slug'])` to limit columns.
- Use `whenLoaded()` in Resources to avoid lazy-loading in serialization.
- Add query-budget regression tests for critical endpoints (assert query counts).
- Use `scan:queries` diagnostic (dev) to find hotspots; prefer `--dump-sql --trace` for details.

---

**Caching & Cache Invalidation**
- Cache static lists (categories/tags/roles) with short TTLs and tag support when available.
- Invalidate caches in write paths (create/update/delete) via tag-aware `CacheService`.
- Warm cache in deployment using `php artisan warm:cache` or the project's `WarmCache` command.

---

**Debugging & Diagnostics**
- Use `php artisan scan:queries` to profile endpoints. Use `--keep-debugbar` to capture Debugbar collectors when you want to reproduce what a developer sees in the browser.
- The repo prevents lazy-loading in non-prod via `Model::preventLazyLoading(! app()->isProduction())` to catch N+1s early.

---

**Security & Secrets**
- Never put secrets in the repo. Use env vars, Docker secrets, or a secrets manager.
- Keep `APP_KEY`, DB passwords, and Redis credentials out of version control.

---

**AI-Agent Prompt Templates**
Use these templates when asking an AI agent (or instructing an assistant like the onboard agent) to modify repo code. They are designed to be safe, minimal, and verifiable.

- Minimal change + tests (safe):

```
You are an AI coding assistant with repo access. Task: <short task description>.
Constraints: make the smallest, safest change possible; do not refactor unrelated code; always add or update tests that validate the change.
Before editing files: update the `manage_todo_list` with concise steps.
Editing rules: use `apply_patch` to modify files; preserve existing style and public APIs.
After edits: run relevant tests and report results.
If you cannot run tests, produce commands a human can run to verify.
```

- Add feature (example):

```
Add a regression test for `/api/tools?q=test` ensuring <= 6 queries.
Implement the test under `backend/tests/Feature/Api/ToolQueryCountTest.php` using `RefreshDatabase`.
Run `php artisan test --filter=ToolQueryCountTest` and report pass/fail and any failures.
```

- Performance/N+1 triage (example):

```
Run `php artisan scan:queries --dump-sql --full-trace` and summarize endpoints with highest query counts.
For the top endpoint, open the controller/resource and ensure relations are eager-loaded via `with()` or a `withRelations()` scope, and resources use `whenLoaded()`.
Add a query-budget test for that endpoint after changes.
```

- Pre-patch preamble (agent behavior):

```
Preamble: I will (1) update the todo list with planned steps; (2) apply a small patch using `apply_patch`; (3) run focused tests; (4) report results and next steps.
Only proceed if tests pass locally or fail with actionable errors.
```

---

**Example Prompts to Get Consistent Behavior**
-
