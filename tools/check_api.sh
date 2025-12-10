#!/usr/bin/env bash
# Simple API health check script for the local dev environment
# Usage: ./check_api.sh [base_url]
# Default base_url: http://localhost:8201

BASE_URL=${1:-http://localhost:8201}

echo "Checking API health at ${BASE_URL}..."

set -o pipefail

echo -n "GET /api/health -> "
curl -sS -w "HTTP/%{http_version} %{http_code}\n" -H "Accept: application/json" "${BASE_URL}/api/health" -o /tmp/check_api_health.out || { echo "request failed"; exit 2; }
cat /tmp/check_api_health.out

echo -n "GET /api/tools -> "
curl -sS -w "HTTP/%{http_version} %{http_code}\n" -H "Accept: application/json" "${BASE_URL}/api/tools" -o /tmp/check_api_tools.out || { echo "request failed"; exit 3; }
cat /tmp/check_api_tools.out

# Return success if both returned 200
HEALTH_CODE=$(tail -n1 /tmp/check_api_health.out | sed -n '1p' 2>/dev/null || true)
TOOLS_CODE=$(tail -n1 /tmp/check_api_tools.out | sed -n '1p' 2>/dev/null || true)

# Parse HTTP status from curl output's trailing line if available
HEALTH_STATUS=$(tail -n1 /tmp/check_api_health.out | sed -n '1p' | awk '{print $2}' 2>/dev/null || true)
TOOLS_STATUS=$(tail -n1 /tmp/check_api_tools.out | sed -n '1p' | awk '{print $2}' 2>/dev/null || true)

# Fallback scanning the files for JSON to determine likely success
if [ -z "$HEALTH_STATUS" ]; then
  if grep -q "\"ok\"" /tmp/check_api_health.out 2>/dev/null; then
    HEALTH_STATUS=200
  fi
fi
if [ -z "$TOOLS_STATUS" ]; then
  if grep -q "\"data\"" /tmp/check_api_tools.out 2>/dev/null; then
    TOOLS_STATUS=200
  fi
fi

if [ "$HEALTH_STATUS" = "200" ] && [ "$TOOLS_STATUS" = "200" ]; then
  echo "OK: both endpoints returned 200"
  exit 0
else
  echo "WARN: health=${HEALTH_STATUS:-unknown}, tools=${TOOLS_STATUS:-unknown}"
  exit 1
fi
