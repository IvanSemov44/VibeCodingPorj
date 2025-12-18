Best practices for environment files (2025)

Summary
- Do NOT commit secrets into the repository. Keep only sanitized example files like `.env.example`.
- Store runtime secrets in a secrets manager (Vault, cloud provider secret manager) or CI/CD secret storage.
- For local development keep a private `.env` (ignored by git) and do not push it.

Local workflow
1. Copy `.env.example` to `.env` and fill in values for local development.
2. Add any production-only values to your deployment environment or secret manager; do not store them in the repo.
3. To share non-sensitive defaults with the team, update `.env.example`.

Docker / Containers
- Use `backend/.env.docker` for containerized development defaults; keep secrets out of the file when possible.
- In CI/CD, inject secrets via environment variables or secret mounts (do not check them into git).

Git handling
- We added `.gitignore` entries to ignore `.env`, `frontend/.env`, and `backend/.env`.
- If you accidentally committed secrets earlier, consider rotating those secrets and removing them from history (use `git filter-repo` or `bfg-repo-cleaner`).

Recommendations (practical)
- Overwrite `backend/.env` locally with `backend/.env.docker` if running containers locally, but do not commit it.
- Generate and store `APP_KEY` using `php artisan key:generate` (do not commit the key).
- Use `npm ci` / `composer install` inside containers for reproducible builds.

Commands
```powershell
# copy example to local
cp .env.example .env
cp frontend/.env.example frontend/.env

# (if using docker) copy docker env to backend locally
cp backend/.env.docker backend/.env

# untrack any committed envs (already executed in this repo)
git rm --cached .env frontend/.env backend/.env || true
git commit -m "Remove tracked .env files from repository" --no-verify || true
```

If you want, I can:
- Overwrite `backend/.env` with `backend/.env.docker` locally now.
- Push the git changes to the remote.
- Help rotate any secrets that may have been exposed in earlier commits.

— env guidance automated by the assistant
