#!/bin/sh
set -euo pipefail

echo "Migrator: waiting for database to accept connections..."

MAX_RETRIES=60
COUNT=0
SLEEP=2

MYSQL_CMD_BASE="mysql -h \"$DB_HOST\" -P \"$DB_PORT\" -u \"$DB_USERNAME\" -p\"$DB_PASSWORD\" -D \"$DB_DATABASE\" -sse"

while ! mysqladmin ping -h "$DB_HOST" -P "$DB_PORT" --silent; do
  COUNT=$((COUNT+1))
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "Migrator: database did not become available after ${MAX_RETRIES} attempts"
    exit 1
  fi
  echo "Migrator: waiting for database... (${COUNT}/${MAX_RETRIES})"
  sleep $SLEEP
done

MIGRATIONS_MARKER="/var/www/html/.migrations_done"
LOCK_NAME="migrate_and_seed_lock"

acquire_lock() {
  # Try to acquire a named lock in MySQL so only one container runs migrations/seeds
  LOCK_RESULT=$(eval "$MYSQL_CMD_BASE \"SELECT GET_LOCK('$LOCK_NAME', 5);\"") || true
  [ "$LOCK_RESULT" = "1" ]
}

release_lock() {
  eval "$MYSQL_CMD_BASE \"SELECT RELEASE_LOCK('$LOCK_NAME');\"" || true
}

trap 'release_lock || true' EXIT

echo "Migrator: attempting to acquire DB lock ($LOCK_NAME)"
LOCK_ACQUIRED=0
TRY=0
while [ $TRY -lt 30 ]; do
  if acquire_lock; then
    LOCK_ACQUIRED=1
    break
  fi
  TRY=$((TRY+1))
  echo "Migrator: waiting for lock... (${TRY}/30)"
  sleep 2
done

if [ "$LOCK_ACQUIRED" -ne 1 ]; then
  echo "Migrator: could not acquire lock after retries; exiting"
  exit 1
fi

if [ -f "$MIGRATIONS_MARKER" ]; then
  echo "Migrator: marker file exists; skipping migrations and seeds"
  exit 0
fi

echo "Migrator: running migrations"
if php artisan migrate --force; then
  echo "Migrator: migrations succeeded; running seeders"
  # Run seeders but avoid failing the container if seeding has non-fatal issues
  if php artisan db:seed --force; then
    echo "Migrator: seeders completed"
  else
    echo "Migrator: seeders had errors (non-fatal)"
  fi
  echo "Migrator: marking migrations done"
  date -u +"%Y-%m-%dT%H:%M:%SZ" > "$MIGRATIONS_MARKER"
  echo "Migrator: finished"
  exit 0
else
  echo "Migrator: migrations failed"
  exit 1
fi
