# Contributing — AI Workflow

This project supports controlled AI-assisted changes. The goal is to ensure any automated edits are checked and, if possible, auto-fixed before the AI finishes its response or a human merges the work.

Key files
- AI config: [full-stack-starter-kit/frontend/ai-action.config.json](full-stack-starter-kit/frontend/ai-action.config.json)
- Runner script: [full-stack-starter-kit/frontend/scripts/run-ai-checks.js](full-stack-starter-kit/frontend/scripts/run-ai-checks.js)
- Post-commit hook: [full-stack-starter-kit/frontend/.husky/post-commit](full-stack-starter-kit/frontend/.husky/post-commit)

AI agent responsibilities
- After applying changes, always execute the configured checks from the `frontend` package root before finalizing the reply.
- Run the checks with:

```bash
cd full-stack-starter-kit/frontend
node ./scripts/run-ai-checks.js
```

- If the AI created a commit and wants auto-fixes included in that same commit, run with `--amend`:

```bash
node ./scripts/run-ai-checks.js --amend
```

- The script runs the commands declared in `ai-action.config.json` (by default: `typecheck`, `lint:fix`, `format`) and prints a machine-readable summary between the markers:

```
=== AI-CHECKS-SUMMARY-BEGIN ===
{...json...}
=== AI-CHECKS-SUMMARY-END ===
```

The AI must parse that JSON block and include its results (success/failure and any changed files) in its final answer.

Commit conventions for AI edits
- Prefer commit messages containing one of the configured markers (default: `[ai]`, `[auto]`) or use an author email that matches the configured `authorEmailPatterns` so hooks can detect AI commits.
- Example commit message:

```bash
git commit -m "[ai] Apply automated refactor for X"
```

Local developer notes
- To enable Git hooks once (developer machine):

```bash
cd full-stack-starter-kit/frontend
npx husky install
```

- To run a continuous watcher that applies fixes automatically:

```bash
npm --prefix full-stack-starter-kit/frontend run watch:fix
```

CI recommendation
- Add `npm --prefix full-stack-starter-kit/frontend run typecheck && npm --prefix full-stack-starter-kit/frontend run lint && npm --prefix full-stack-starter-kit/frontend run format -- --check` to your CI pre-merge checks.

Questions or changes
- If you want a repository-wide AI check (all packages), open an issue proposing a root `ai-action.config.json` and a dispatcher script; this file currently configures the `frontend` package only.
