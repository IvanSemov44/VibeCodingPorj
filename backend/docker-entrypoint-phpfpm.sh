#!/bin/sh
set -e

echo "Starting php-fpm entrypoint: waiting for database..."

MAX_RETRIES=30
COUNT=0

while ! php -r "try { new PDO(sprintf('mysql:host=%s;dbname=%s;port=%s', getenv('DB_HOST'), getenv('DB_DATABASE'), getenv('DB_PORT')), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); echo 'connected'; } catch (Exception \$e) { exit(1); }" >/dev/null 2>&1; do
  COUNT=$((COUNT+1))
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "Database did not become available after ${MAX_RETRIES} attempts"
    break
  fi
  echo "Waiting for database... (${COUNT}/${MAX_RETRIES})"
  sleep 2
done

echo "Running migrations and seeders (if any)..."
# Ensure .env exists and APP_KEY is set before running migrations
if [ ! -f .env ]; then
  if [ -f env.template ]; then
    echo "Creating .env from env.template"
    cp env.template .env
  else
    echo "Warning: env.template not found; creating empty .env"
    touch .env
  fi
fi

# If APP_KEY is missing or empty, generate one now so it's available during startup
if ! grep -q '^APP_KEY=' .env || grep -q '^APP_KEY=$' .env; then
  echo "APP_KEY missing or empty — generating application key"
  php artisan key:generate --force || echo "php artisan key:generate failed"
fi
# Ensure doctrine/dbal is present for migrations that use Doctrine schema helpers
if [ ! -d vendor/doctrine/dbal ]; then
  echo "doctrine/dbal not found in vendor; installing via composer..."
  composer require doctrine/dbal --no-interaction --no-progress --prefer-dist || true
fi

# Run migrations and seeders; continue even if they fail initially
php artisan migrate --force || true
php artisan db:seed --force || true

echo "Starting php-fpm"
exec php-fpm
