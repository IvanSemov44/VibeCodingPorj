# AI Agent Prompts & Mandatory Checklist

This document provides ready-to-use prompt templates and a strict checklist an AI agent must follow when making changes in this repository. Use these templates to ensure safe, minimal, and verifiable edits.

## Mandatory Agent Checklist (must run for every change)
1. Update `manage_todo_list` with concise steps for the work (at least 3 steps for non-trivial tasks).
2. Run the repository test subset relevant to the change. If PHP: run `php artisan test --filter=...` inside `php_fpm` container.
3. Run `php artisan scan:queries --dump-sql --trace` for endpoints that could be affected by DB changes (N+1 risk).
4. Run static analysis/lint (frontend `npm run lint`, backend `composer phpstan` if configured).
5. Apply patches only with `apply_patch`. Keep changes minimal and focused. Do not reorder or rename unrelated files.
6. Re-run the affected tests. If they fail, revert the change and report errors.
7. Add or update tests covering the changed behavior, especially for N+1/performance fixes or migrations.
8. Add a short note to `BEST_PRACTICES_2025.md` or `CHANGELOG.md` if behavior/contract changes.
9. Prepare a PR description with: summary, files changed, tests added, how to verify locally, and risk/rollback notes.

## General Preamble Template (agent behavior)
Use this preamble before any multi-file edit:

```
Preamble: I'll (1) add the planned steps to the todo list; (2) make a small, targeted patch using apply_patch; (3) run unit/feature tests relevant to the change; (4) run `scan:queries` if the change affects DB or serialization; (5) report results and next steps. Proceed only if tests pass or produce actionable failures.
```

---

## Prompt Templates

1) Minimal Change + Tests (safe default)

```
You are an AI coding assistant with workspace access.
Goal: <one-sentence description of bug or feature>.
Constraints:
- Make the smallest code change that fixes the issue.
- Add or update tests that validate the intended behavior.
- Do not modify unrelated files or versions.
Actions:
1. Add a todo-list entry explaining 3 steps.
2. Apply the patch using `apply_patch`.
3. Run only the tests that target the change and report results.
4. If tests pass, print the git commands to create a branch and push.
```

Example: Add schema-level index

```
Task: Add DB index on `tools.status`.
Actions: create migration file, run `php artisan migrate` in container (or provide command), and add a simple DB test that queries by status.
```

2) Refactor (must include tests)

```
You are an AI coding assistant.
Goal: Refactor <component> to improve readability/perf without changing public behavior.
Rules:
- Add tests that prove equivalence before/after or run existing tests.
- Keep changes in a single branch.
- Do not change public APIs unless absolutely necessary; document any change.
Actions: same mandatory checklist + run full test suite for the modified package.
```

3) Performance / N+1 Fix

```
Goal: Reduce N+1 queries for endpoint `/api/...`.
Steps:
1. Run `php artisan scan:queries --dump-sql --trace` and include the top offending SQL.
2. Edit controller/resource to add scoped eager-loading (e.g. `withRelations()` or `with(['categories:id,name'])`).
3. Use `whenLoaded()` in resource to prevent lazy loads.
4. Add a query-budget test asserting an upper bound on DB queries for that endpoint.
5. Re-run `scan:queries` and report before/after counts.
```

4) Migration + Data Change

```
Goal: Add non-breaking migration X and backfill data safely.
Rules:
- Use guarded migrations: check for indexes/columns before creating.
- Backfill in batches; avoid locking large tables.
- Add a test to ensure the new column/index is present.
Actions: create migration, include `up()`/`down()`, and a small script (or artisan command) for safe backfill.
```

5) CI Job or Test Addition

```
Goal: Add a CI job that runs query-budget tests.
Actions:
1. Add job to `.github/workflows/ci.yml` (or equivalent) to run `composer install` and `php artisan test --filter=QueryBudget`.
2. Keep the job fast by running only targeted tests.
3. Document in PR description why the job is needed.
```

---

## Safe Abort Conditions (agent must stop and report)
- Cannot run tests due to missing dependencies or extension failures (report exact error).
- A change causes >5 failing tests unrelated to the change.
- Migration would drop data or perform an unsafe transformation without a migration plan.
- The patch requires secrets or external credentials not available in the environment.

If any of the above occur: stop, revert any partial changes, add the failure details to the todo list, and ask for guidance.

---

## Example Minimal Agent Session
1. Preamble + todo update.
2. `apply_patch` to modify `ToolController.php` and `Tool.php` (one logical change).
3. Run `php artisan test --filter=ToolQueryCountTest` inside container.
4. Run `php artisan scan:queries --dump-sql --trace` for `/api/tools`.
5. If OK, output git commands to push branch and suggested PR title/body.

---

If you'd like, I can: (A) commit and push the `BEST_PRACTICES_2025.md` and this new doc on a branch and open a PR draft; or (B) only create the branch and provide the git commands for you. Which do you prefer?
