#!/bin/sh
set -e

# Only install if node_modules doesn't exist or is incomplete
if [ ! -d "node_modules" ] || [ ! -d "node_modules/.bin" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting Next.js development server..."
exec npm run dev
