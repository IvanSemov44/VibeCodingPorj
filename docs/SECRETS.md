# Secrets and Redis configuration

This document describes recommended approaches for managing secrets (Redis password, other credentials) and how to use the provided Docker Compose setup.

IMPORTANT: Never commit secret values (passwords, API keys) into the repository.

## Local development

1. Use the example config file for Redis that is checked into the repo:

   - `backend/docker/redis/redis.conf.example`

2. Create a local config file for Redis (do NOT commit this file):

```bash
# create a directory if it doesn't exist
mkdir -p backend/docker/redis
cp backend/docker/redis/redis.conf.example backend/docker/redis/redis.conf
# Edit backend/docker/redis/redis.conf: uncomment and set `requirepass` only if
# you want to enable a local password. Otherwise leave it commented for no-auth local dev.
```

3. If you enable a password in `redis.conf` (production-like), provide the same password to Laravel via environment variable or Docker secret. For local dev you can leave password blank and Laravel will not attempt AUTH.

## Production (recommended)

1. Use Docker secrets (or your cloud provider secret manager). Don't put the secret in repo or in plain `env` files.

2. Create a Docker secret (example):

```bash
# from repo root (make sure you have a file with the secret value)
mkdir -p secrets
printf "%s" "my-super-strong-redis-password" > secrets/redis_password.txt
# create the secret in Docker
docker secret create redis_password secrets/redis_password.txt
```

3. Ensure your orchestrator mounts the `redis.conf` that contains `requirepass <PASSWORD>` or configure Redis at container start using the secret.

4. Provide the same secret to the PHP containers as an environment variable `REDIS_PASSWORD` (via secret injection or platform env vars). Our `backend/docker-compose.yml` supports reading `/run/secrets/redis_password` into `REDIS_PASSWORD` if you use Docker secrets.

## If you prefer mounting `redis.conf` explicitly

- Put your `redis.conf` on the host (outside the repo or in a protected directory), then mount it in `backend/docker-compose.yml`:

```yaml
services:
  redis:
    volumes:
      - /path/to/secure/redis.conf:/usr/local/etc/redis/redis.conf:ro
```

- Ensure the mounted `redis.conf` has `requirepass` set, and make sure the PHP containers can read the password (via secret or env).

## CI / Deploy tips

- Use your CI provider's secret store to inject `REDIS_PASSWORD` during the deploy step. Do not echo or print secrets in logs.
- Add a smoke test that verifies `redis-cli -a "$REDIS_PASSWORD" ping` returns `PONG` (or equivalent) after deployment.

## Files you should not commit

- `backend/docker/redis/redis.conf` (it's added to `.gitignore`)
- Any `secrets/*.txt` files holding raw secret values
- Any `.env` file containing secrets (use `.env.example` instead)

## Quick check list

- [ ] `redis.conf` not in repo
- [ ] Docker secret created for production
- [ ] `REDIS_PASSWORD` set in production env or injected from secret
- [ ] CI smoke test validates Redis connectivity

If you want, I can add a small script to your repo that helps create the Docker secret from an env var or local file (but it will not commit the secret). Let me know.
