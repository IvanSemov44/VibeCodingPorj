# Deployment Guide - Full-Stack Starter Kit

This guide provides step-by-step instructions for deploying the full-stack application on Windows, Linux, and macOS.

## Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Git** (for cloning the repository)
- **PowerShell 7+** (for Windows users using deploy.ps1)

## Quick Start

### Windows (PowerShell)

```powershell
# Clone the repository (if not already done)
git clone <repository-url>
cd full-stack-starter-kit

# Run the deployment script
.\deploy.ps1

# For a clean installation (removes all data):
.\deploy.ps1 -Clean

# To skip tests:
.\deploy.ps1 -SkipTests
```

### Linux / macOS (Bash)

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd full-stack-starter-kit

# Run the start script
chmod +x start.sh
./start.sh
```

## Manual Deployment Steps

If you prefer to run commands manually:

### 1. Stop and Clean Existing Containers

```powershell
# Windows PowerShell
docker compose down -v

# Linux/macOS Bash
docker-compose down -v
```

### 2. Build and Start Services

```powershell
# Build PHP image
docker compose build php_fpm

# Start all services
docker compose up -d
```

### 3. Wait for MySQL to be Ready

```powershell
# Check MySQL health (should show "healthy" after ~30 seconds)
docker inspect --format='{{.State.Health.Status}}' vibecode-full-stack-starter-kit_mysql
```

### 4. Install Dependencies and Run Migrations

```powershell
# Install Composer dependencies
docker compose exec php_fpm composer install --no-interaction --prefer-dist

# Generate application key
docker compose exec php_fpm php artisan key:generate --force

# Run migrations
docker compose exec php_fpm php artisan migrate --force

# Seed database with demo data
docker compose exec php_fpm php artisan db:seed --force

# Cache configuration
docker compose exec php_fpm php artisan config:cache
docker compose exec php_fpm php artisan route:cache
```

### 5. Verify Installation

Check service status:
```powershell
docker compose ps
```

All services should show "Up" or "Up (healthy)".

## Access URLs

- **Frontend (Next.js)**: http://localhost:8200
- **Backend (Laravel API)**: http://localhost:8201
- **API Status Check**: http://localhost:8201/api/status
- **MySQL**: localhost:8203 (external access)
- **Redis**: localhost:8204 (external access)

## Demo Credentials

Use these credentials to log in:

- **Email**: `cli@local` or `ivan@admin.local`
- **Password**: `P@ssw0rd!`

Additional demo users:
- `elena@frontend.local` - Frontend Developer role
- `petar@backend.local` - Backend Developer role
- `maria@pm.local` - Project Manager role
- All use the same password: `P@ssw0rd!`

## Verification Steps

### 1. Check Docker Services

```powershell
docker compose ps
```

Expected output - all services should be "Up":
```
NAME                                          STATUS
vibecode-full-stack-starter-kit_frontend      Up (healthy)
vibecode-full-stack-starter-kit_backend       Up
vibecode-full-stack-starter-kit_php_fpm       Up (healthy)
vibecode-full-stack-starter-kit_mysql         Up (healthy)
vibecode-full-stack-starter-kit_redis         Up
vibecode-full-stack-starter-kit_tools         Up
```

### 2. Test API Endpoint

```powershell
# Windows PowerShell
curl http://localhost:8201/api/status

# Linux/macOS
curl http://localhost:8201/api/status
```

Expected response:
```json
{"status":"ok","time":"2025-12-11 10:00:00"}
```

### 3. Test Frontend

1. Open browser: http://localhost:8200
2. You should see the home page
3. Click "Login"
4. Enter credentials: `cli@local` / `P@ssw0rd!`
5. You should be redirected to the dashboard

### 4. Test Sanctum Authentication Flow

```powershell
# Get CSRF cookie
curl -c cookies.txt http://localhost:8201/sanctum/csrf-cookie

# Login (using saved cookies)
curl -b cookies.txt -c cookies.txt -X POST http://localhost:8201/api/login `
  -H "Content-Type: application/json" `
  -H "Accept: application/json" `
  -d '{"email":"cli@local","password":"P@ssw0rd!"}'

# Get authenticated user
curl -b cookies.txt http://localhost:8201/api/user
```

Expected: User data returned successfully.

## Troubleshooting

### Issue: Port Already in Use

**Symptoms**: Error `bind: address already in use`

**Solution**:
```powershell
# Find what's using the port (Windows)
netstat -ano | findstr :8200
netstat -ano | findstr :8201

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
```

### Issue: MySQL Not Healthy

**Symptoms**: MySQL service stuck in "starting" or "unhealthy"

**Solution**:
```powershell
# Check MySQL logs
docker compose logs mysql

# Remove MySQL volume and restart
docker compose down -v
docker compose up -d
```

### Issue: Frontend ENOTEMPTY Error (Windows)

**Symptoms**: Frontend container crashes with ENOTEMPTY or module errors

**Solution**:
This is now fixed with named volumes. If you still see issues:

```powershell
# Clean installation
docker compose down -v
docker volume rm vibecode-full-stack-starter-kit_frontend_node_modules
docker volume rm vibecode-full-stack-starter-kit_frontend_next
.\deploy.ps1 -Clean
```

### Issue: Laravel APP_KEY Missing

**Symptoms**: `RuntimeException: No application encryption key has been specified.`

**Solution**:
```powershell
docker compose exec php_fpm php artisan key:generate --force
docker compose exec php_fpm php artisan config:cache
docker compose restart backend php_fpm
```

### Issue: CORS Errors in Browser

**Symptoms**: Browser console shows CORS errors when calling API

**Solution**:
1. Verify `backend/.env` has correct settings:
   ```
   SANCTUM_STATEFUL_DOMAINS=localhost:8200,localhost:3000,localhost,127.0.0.1,127.0.0.1:8200
   FRONTEND_URL=http://localhost:8200,http://localhost:3000
   SESSION_DOMAIN=null
   SESSION_SAME_SITE=None
   ```

2. Clear browser cookies for localhost:8200 and localhost:8201

3. Restart services:
   ```powershell
   docker compose restart backend php_fpm
   ```

### Issue: Login Not Working (401 Unauthorized)

**Symptoms**: Login returns 401 or session not persisting

**Solution**:
1. Clear browser cookies completely
2. Open browser DevTools → Application → Cookies → Delete all for localhost
3. Visit http://localhost:8200 in incognito/private mode
4. Verify CSRF token is set in cookies after visiting the page

### Issue: Database Connection Refused

**Symptoms**: `SQLSTATE[HY000] [2002] Connection refused`

**Solution**:
```powershell
# Check if MySQL is running
docker compose ps mysql

# Check MySQL logs
docker compose logs mysql

# Wait longer for MySQL to start (30-60 seconds)
# Then restart PHP container
docker compose restart php_fpm
```

## Advanced Operations

### View Logs

```powershell
# All logs
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f php_fpm
docker compose logs -f mysql
```

### Access Container Shell

```powershell
# Frontend container
docker compose exec frontend sh

# PHP/Laravel container
docker compose exec php_fpm sh

# MySQL CLI
docker compose exec mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass vibecode-full-stack-starter-kit_app
```

### Run Artisan Commands

```powershell
# Any artisan command
docker compose exec php_fpm php artisan <command>

# Examples:
docker compose exec php_fpm php artisan migrate:status
docker compose exec php_fpm php artisan route:list
docker compose exec php_fpm php artisan tinker
```

### Reset Database

```powershell
# Fresh migration + seed
docker compose exec php_fpm php artisan migrate:fresh --seed

# Or using composer script
docker compose exec php_fpm composer db:fresh
```

### Run Tests

```powershell
# Backend tests
docker compose exec php_fpm php artisan test

# Frontend tests (from host)
cd frontend
npm test
```

## Environment Variables

### Backend (.env)

Critical environment variables:

```env
APP_URL=http://localhost:8201
DEMO_USER_PASSWORD=P@ssw0rd!

DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=vibecode-full-stack-starter-kit_app
DB_USERNAME=root
DB_PASSWORD=vibecode-full-stack-starter-kit_mysql_pass

REDIS_HOST=redis
REDIS_PASSWORD=vibecode-full-stack-starter-kit_redis_pass

SESSION_DRIVER=redis
SESSION_DOMAIN=null
SESSION_SAME_SITE=None

SANCTUM_STATEFUL_DOMAINS=localhost:8200,localhost:3000,localhost,127.0.0.1,127.0.0.1:8200
FRONTEND_URL=http://localhost:8200,http://localhost:3000
```

### Frontend (.env.local - optional)

```env
NEXT_PUBLIC_API_URL=http://localhost:8201/api
```

## Security Considerations

### Development vs Production

Current configuration is for **DEVELOPMENT ONLY**:

- `SESSION_SAME_SITE=None` allows cross-origin cookies (localhost:8200 ↔ localhost:8201)
- `SESSION_SECURE_COOKIE=false` allows cookies over HTTP
- `APP_DEBUG=true` shows detailed errors

### Production Recommendations

For production deployment:

1. Use HTTPS for both frontend and backend
2. Update `.env`:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   SESSION_SECURE_COOKIE=true
   SESSION_SAME_SITE=Strict
   SESSION_DOMAIN=yourdomain.com
   ```

3. Use strong passwords (not demo credentials)
4. Set up proper secret management
5. Enable rate limiting and security headers
6. Run `php artisan config:cache` and `php artisan route:cache`

## Backup and Restore

### Backup Database

```powershell
# Create backup
.\db-manage.sh backup

# Manual backup
docker compose exec mysql mysqldump -u root -pvibecode-full-stack-starter-kit_mysql_pass vibecode-full-stack-starter-kit_app > backup.sql
```

### Restore Database

```powershell
# Restore from backup
docker compose exec -T mysql mysql -u root -pvibecode-full-stack-starter-kit_mysql_pass vibecode-full-stack-starter-kit_app < backup.sql
```

## Stopping the Application

```powershell
# Stop services (keeps data)
docker compose down

# Stop and remove all data
docker compose down -v
```

## Next Steps

- Review [README.md](README.md) for project overview
- Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for component examples
- See [DOCUMENTATION.md](DOCUMENTATION.md) for API documentation
- Review [CHANGES.md](CHANGES.md) for recent updates

## Support

For issues or questions:
- Check logs: `docker compose logs -f`
- Review troubleshooting section above
- Check Docker status: `docker compose ps`
- Verify environment variables in `backend/.env`
