#!/usr/bin/env pwsh
# PowerShell deployment script for Windows
# Usage: .\deploy.ps1 [-Clean] [-SkipTests]

param(
    [switch]$Clean = $false,
    [switch]$SkipTests = $false
)

$ErrorActionPreference = "Continue"
Write-Host "🚀 Full-Stack Starter Kit - Windows Deployment Script" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "🔍 Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker command failed"
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Stop and remove existing containers
Write-Host ""
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker compose down
if ($Clean) {
    Write-Host "🗑️  Removing volumes (clean install)..." -ForegroundColor Yellow
    docker compose down -v

    # Remove problematic volumes explicitly
    docker volume rm vibecode-full-stack-starter-kit_frontend_node_modules -f 2>$null
    docker volume rm vibecode-full-stack-starter-kit_frontend_next -f 2>$null

    Write-Host "✅ Clean environment prepared" -ForegroundColor Green
}

# Build PHP image
Write-Host ""
Write-Host "📦 Building PHP Docker image..." -ForegroundColor Yellow
docker compose build php_fpm
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  PHP image build failed, continuing..." -ForegroundColor Yellow
}

# Pre-start: Clear Laravel cache
Write-Host ""
Write-Host "🧹 Clearing Laravel cache (pre-start)..." -ForegroundColor Yellow
if (Test-Path "backend\bootstrap\cache\config.php") {
    Remove-Item "backend\bootstrap\cache\config.php" -Force
}

# Start all services
Write-Host ""
Write-Host "🔄 Starting all Docker services..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    exit 1
}

# Wait for MySQL to be healthy
Write-Host ""
Write-Host "⏳ Waiting for MySQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
do {
    Start-Sleep -Seconds 2
    $attempt++
    $health = docker inspect --format='{{.State.Health.Status}}' vibecode-full-stack-starter-kit_mysql 2>$null
    Write-Host "   Attempt $attempt/$maxAttempts : MySQL status = $health" -ForegroundColor Gray
} while ($health -ne "healthy" -and $attempt -lt $maxAttempts)

if ($health -ne "healthy") {
    Write-Host "⚠️  MySQL did not become healthy, continuing anyway..." -ForegroundColor Yellow
} else {
    Write-Host "✅ MySQL is ready" -ForegroundColor Green
}

# Laravel setup
Write-Host ""
Write-Host "🔧 Setting up Laravel backend..." -ForegroundColor Yellow

# Check if Composer dependencies exist
if (-not (Test-Path "backend\vendor")) {
    Write-Host "📦 Installing Composer dependencies..." -ForegroundColor Yellow
    docker compose exec -T php_fpm composer install --no-interaction --prefer-dist --optimize-autoloader
}

# Generate APP_KEY if not set
$envContent = Get-Content "backend\.env" -Raw
if (-not ($envContent -match "APP_KEY=base64:[A-Za-z0-9+/=]{40,}")) {
    Write-Host "🔐 Generating application key..." -ForegroundColor Yellow
    docker compose exec -T php_fpm php artisan key:generate --force
}

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
docker compose exec -T php_fpm php artisan migrate --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Migrations failed, continuing..." -ForegroundColor Yellow
}

# Seed database
Write-Host "🌱 Seeding database with demo data..." -ForegroundColor Yellow
docker compose exec -T php_fpm php artisan db:seed --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Seeding failed, continuing..." -ForegroundColor Yellow
}

# Clear and cache Laravel configuration
Write-Host "♻️  Caching Laravel configuration..." -ForegroundColor Yellow
docker compose exec -T php_fpm php artisan config:clear
docker compose exec -T php_fpm php artisan config:cache
docker compose exec -T php_fpm php artisan route:cache

# Set permissions (if not running as laravel user)
Write-Host "🔒 Setting file permissions..." -ForegroundColor Yellow
docker compose exec -T php_fpm chown -R laravel:laravel /var/www/html/storage 2>$null
docker compose exec -T php_fpm chown -R laravel:laravel /var/www/html/bootstrap/cache 2>$null

# Run tests if not skipped
if (-not $SkipTests) {
    Write-Host ""
    Write-Host "🧪 Running backend tests..." -ForegroundColor Yellow
    docker compose exec -T php_fpm php artisan test --parallel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Some tests failed" -ForegroundColor Yellow
    } else {
        Write-Host "✅ All backend tests passed" -ForegroundColor Green
    }
}

# Display service status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker compose ps

# Display access URLs
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend (Next.js): http://localhost:8200" -ForegroundColor White
Write-Host "  Backend (Laravel):  http://localhost:8201" -ForegroundColor White
Write-Host "  API Status:         http://localhost:8201/api/status" -ForegroundColor White

# Display demo credentials
Write-Host ""
Write-Host "🔑 Demo Login Credentials:" -ForegroundColor Cyan
Write-Host "  Email:    cli@local OR ivan@admin.local" -ForegroundColor White
Write-Host "  Password: P@ssw0rd!" -ForegroundColor White

# Display useful commands
Write-Host ""
Write-Host "📋 Useful Commands:" -ForegroundColor Cyan
Write-Host "  docker compose logs -f          # View all logs" -ForegroundColor Gray
Write-Host "  docker compose logs -f frontend # View frontend logs" -ForegroundColor Gray
Write-Host "  docker compose logs -f backend  # View backend logs" -ForegroundColor Gray
Write-Host "  docker compose ps               # Check service status" -ForegroundColor Gray
Write-Host "  docker compose down             # Stop all services" -ForegroundColor Gray
Write-Host "  docker compose down -v          # Stop and remove volumes" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Deployment complete! Visit http://localhost:8200 to get started." -ForegroundColor Green
Write-Host ""

# Optional: Tail logs
$tailLogs = Read-Host "Would you like to view logs? (y/N)"
if ($tailLogs -eq 'y' -or $tailLogs -eq 'Y') {
    Write-Host "📜 Tailing logs (Ctrl+C to exit)..." -ForegroundColor Yellow
    docker compose logs -f
}
