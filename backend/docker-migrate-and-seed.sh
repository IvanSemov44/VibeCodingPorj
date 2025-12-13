#!/bin/sh
set -e

echo "Migrator: waiting for database to accept connections..."

MAX_RETRIES=30
COUNT=0
SLEEP=2

while ! mysqladmin ping -h "$DB_HOST" -P "$DB_PORT" --silent; do
  COUNT=$((COUNT+1))
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "Migrator: database did not become available after ${MAX_RETRIES} attempts"
    exit 1
  fi
  echo "Migrator: waiting for database... (${COUNT}/${MAX_RETRIES})"
  sleep $SLEEP
done

echo "Migrator: running migrations"
if php artisan migrate --force; then
  echo "Migrator: migrations succeeded; running seeders"
  php artisan db:seed --force || true
  echo "Migrator: marking migrations done"
  date -u +"%Y-%m-%dT%H:%M:%SZ" > /var/www/html/.migrations_done
  echo "Migrator: finished"
  exit 0
else
  echo "Migrator: migrations failed"
  exit 1
fi
