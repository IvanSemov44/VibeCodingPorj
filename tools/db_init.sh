#!/usr/bin/env sh
set -eu

# db_init.sh
# Waits for MySQL, runs migrations, and seeds tools if empty.

DB_HOST=${DB_HOST:-mysql}
DB_PORT=${DB_PORT:-3306}
DB_USER=${MYSQL_USER:-root}
DB_PASS=${MYSQL_ROOT_PASSWORD:-vibecode-full-stack-starter-kit_mysql_pass}
DB_NAME=${MYSQL_DATABASE:-vibecode-full-stack-starter-kit_app}

echo "[db_init] waiting for mysql at ${DB_HOST}:${DB_PORT}..."
until mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASS}" -e 'SELECT 1' >/dev/null 2>&1; do
  printf '.'
  sleep 2
done
echo "\n[db_init] mysql is available"

cd /var/www/html

echo "[db_init] running migrations..."
php artisan migrate --force || true

# Check if tools table has rows
TOOL_COUNT=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASS}" -sN -e "SELECT COUNT(*) FROM \\`${DB_NAME}\\`.tools;" 2>/dev/null || echo "0")

if [ "${TOOL_COUNT}" = "0" ] ; then
  echo "[db_init] seeding ToolSeeder..."
  php artisan db:seed --class="Database\\Seeders\\ToolSeeder" || true
else
  echo "[db_init] tools table already has ${TOOL_COUNT} rows; skipping seed."
fi

# Ensure roles exist before seeding users
ROLE_COUNT=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASS}" -sN -e "SELECT COUNT(*) FROM \\`${DB_NAME}\\`.roles;" 2>/dev/null || echo "0")
if [ "${ROLE_COUNT}" = "0" ] ; then
  echo "[db_init] seeding RoleSeeder..."
  php artisan db:seed --class="Database\\Seeders\\RoleSeeder" || true
else
  echo "[db_init] roles table already has ${ROLE_COUNT} rows; skipping role seeder."
fi

# Seed users if none exist (uses DEMO_USER_PASSWORD env inside UserSeeder)
USER_COUNT=$(mysql -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASS}" -sN -e "SELECT COUNT(*) FROM \\`${DB_NAME}\\`.users;" 2>/dev/null || echo "0")
if [ "${USER_COUNT}" = "0" ] ; then
  echo "[db_init] seeding UserSeeder..."
  php artisan db:seed --class="Database\\Seeders\\UserSeeder" || true
else
  echo "[db_init] users table already has ${USER_COUNT} rows; skipping user seeder."
fi

echo "[db_init] done"

exit 0
