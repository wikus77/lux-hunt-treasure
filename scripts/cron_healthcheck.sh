#!/bin/bash
# © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
# HEALTHCHECK: PWA Cron Edge Function
# Usage: CRON_SECRET=xxx ./scripts/cron_healthcheck.sh
#
# Exit codes:
#   0 = healthy (got ok:true)
#   1 = unhealthy (401/error/timeout)

set -e

FUNCTION_URL="https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron"

# Require CRON_SECRET from environment (never hardcode)
if [ -z "$CRON_SECRET" ]; then
  echo "❌ ERROR: CRON_SECRET environment variable not set"
  echo "Usage: CRON_SECRET=your_secret ./scripts/cron_healthcheck.sh"
  exit 1
fi

echo "🔍 PWA Cron Healthcheck"
echo "======================="
echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# Call function with dryRun + bypass
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -H "x-cron-secret: $CRON_SECRET" \
  -d '{"dryRun": true, "bypassQuietHours": true}' \
  --connect-timeout 10 \
  --max-time 30 \
  2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
  # Check if response contains ok:true
  if echo "$BODY" | grep -q '"ok":true'; then
    RUN_ID=$(echo "$BODY" | grep -o '"run_id":"[^"]*"' | cut -d'"' -f4)
    VERSION=$(echo "$BODY" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    SENT=$(echo "$BODY" | grep -o '"sent":[0-9]*' | cut -d':' -f2)
    
    echo "✅ HEALTHY"
    echo "   Run ID: ${RUN_ID:-N/A}"
    echo "   Version: ${VERSION:-N/A}"
    echo "   Sent (dry): ${SENT:-0}"
    exit 0
  else
    echo "⚠️ UNHEALTHY: Response not ok"
    echo "   Body: $(echo "$BODY" | head -c 200)"
    exit 1
  fi
elif [ "$HTTP_CODE" = "401" ]; then
  echo "❌ UNHEALTHY: 401 Unauthorized"
  echo "   Secret mismatch between DB invoker and Edge Function env"
  exit 1
else
  echo "❌ UNHEALTHY: Unexpected status $HTTP_CODE"
  echo "   Body: $(echo "$BODY" | head -c 200)"
  exit 1
fi
