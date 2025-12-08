# Environment Variables

## Frontend (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8201

# Optional: Enable debug mode
NEXT_PUBLIC_DEBUG=false
```

## Backend (.env)

Key environment variables already configured:

```bash
# Application
APP_NAME="VibeCoding"
APP_ENV=local
APP_DEBUG=true

# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=vibecode_db
DB_USERNAME=vibecode_user
DB_PASSWORD=vibecode_pass

# Session & Cache
SESSION_DRIVER=redis
CACHE_DRIVER=redis
REDIS_HOST=redis
REDIS_PASSWORD=vibecode_redis_pass

# Sanctum (SPA Authentication)
SANCTUM_STATEFUL_DOMAINS=localhost:8200,localhost:3000,localhost,127.0.0.1
SESSION_DOMAIN=localhost

# Frontend
FRONTEND_URL=http://localhost:8200
```

## Docker Environment Variables

See `docker-compose.yml` for container-specific variables.

## Adding New Variables

1. **Frontend**: Add to `.env.local` with `NEXT_PUBLIC_` prefix for client-side access
2. **Backend**: Add to `.env` and reference in config files
3. **Docker**: Add to `docker-compose.yml` environment section if needed by containers
