# Environment files and local setup

This repository uses example/template env files tracked in source. Do NOT commit a real `.env`.

Canonical files to use:

- Frontend + orchestration example (copy to project root):
  - `.env.example` (root)

- Backend (API) examples (copy into backend folder):
  - `full-stack-starter-kit/backend/.env.example`
  - `full-stack-starter-kit/backend/.env.docker` (for docker-compose local runs)
  - `full-stack-starter-kit/backend/.env.template` (generic template)

Quick local setup

1. Copy the frontend/orchestration example to `.env` at repo root and fill values if needed:

```bash
cp .env.example .env
```

2. Copy backend example into the backend folder used by the project (the canonical backend folder is under `full-stack-starter-kit/backend`):

```bash
cp full-stack-starter-kit/backend/.env.example full-stack-starter-kit/backend/.env
# or for docker-based local run:
cp full-stack-starter-kit/backend/.env.docker full-stack-starter-kit/backend/.env
```

3. Do NOT commit `.env` files. Ensure `.gitignore` contains `.env`.

Notes

- The repo previously contained duplicate backend env files at the repository root. Those duplicates were removed to avoid confusion; use the `full-stack-starter-kit/backend` variants instead.
- Example/demo passwords included in examples are intended for local development only. Replace them in production.

If you want, I can:
- Add a small check/CI step that fails if a `.env` file is present in a commit.
- Move the remaining canonical env examples to a single `ops/` or `config/` folder if you prefer.
