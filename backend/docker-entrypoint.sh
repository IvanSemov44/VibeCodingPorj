#!/bin/sh
set -e

echo "Starting backend entrypoint: waiting for migrations to finish..."

# Wait until migrator creates the marker file
WAIT_MAX=0
WAIT_COUNT=0
SLEEP=2
MARKER=/var/www/html/.migrations_done

if [ -n "$WAIT_MAX" ] && [ "$WAIT_MAX" -gt 0 ]; then
  echo "Will wait up to ${WAIT_MAX} seconds for migrations marker"
fi

while [ ! -f "$MARKER" ]; do
  WAIT_COUNT=$((WAIT_COUNT+1))
  echo "Waiting for migrations marker... (wait loop ${WAIT_COUNT})"
  sleep $SLEEP
done

echo "Migrations marker found; starting artisan server"
exec php artisan serve --host=0.0.0.0 --port=8000
