#!/bin/bash
# © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
# VERIFY SCRIPT: PWA Cron Environment Check (ENHANCED)
# Usage: ./scripts/verify_pwa_cron.sh [--test]

set -e

SUPABASE_URL="https://vkjrqirvdvjbemsfzxof.supabase.co"
FUNCTION_URL="${SUPABASE_URL}/functions/v1/auto-push-cron"

echo "🔍 PWA CRON VERIFICATION"
echo "========================"
echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# 0. Git state
echo "📦 Git state:"
echo "   Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')"
echo "   Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
echo "   Tag: pwa_cron_ok_20260123_1601"
echo ""

# 1. Check required files exist
echo "📁 Checking files..."
FILES=(
  "supabase/functions/auto-push-cron/index.ts"
  "supabase/functions/auto-push-cron/config.toml"
)
for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "   ✅ $f"
  else
    echo "   ❌ MISSING: $f"
  fi
done
echo ""

# 2. Check config.toml verify_jwt setting
echo "🔐 Edge Function config (config.toml):"
if [ -f "supabase/functions/auto-push-cron/config.toml" ]; then
  grep -i "verify_jwt" supabase/functions/auto-push-cron/config.toml || echo "   (verify_jwt not found)"
else
  echo "   ❌ config.toml missing!"
fi
echo ""

# 3. Check required secrets (names only)
echo "🔑 Required Supabase Edge secrets (verify in Dashboard):"
SECRETS=(
  "SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "VAPID_CONTACT"
  "VAPID_PUBLIC_KEY"
  "VAPID_PRIVATE_KEY"
  "CRON_SECRET"
)
for s in "${SECRETS[@]}"; do
  echo "   - $s"
done
echo ""

# 4. Check Edge Function version
echo "📦 Edge Function version:"
grep "VERSION:" supabase/functions/auto-push-cron/index.ts 2>/dev/null | head -1 || echo "   (not found)"
echo ""

# 5. Check CRON_SECRET in DB function (masked)
echo "🔒 CRON_SECRET in invoke_auto_push_cron (from migrations):"
SECRET_LINE=$(grep -h "cron_secret text :=" supabase/migrations/*.sql 2>/dev/null | tail -1)
if [ -n "$SECRET_LINE" ]; then
  # Extract and mask the secret (show first 8 and last 4 chars)
  SECRET=$(echo "$SECRET_LINE" | grep -oE "'[a-f0-9]{64}'" | tr -d "'")
  if [ -n "$SECRET" ]; then
    echo "   ${SECRET:0:8}...${SECRET: -4} (len=${#SECRET})"
  else
    echo "   (could not extract)"
  fi
else
  echo "   (not found in migrations)"
fi
echo ""

# 6. Test function (optional)
if [ "$1" == "--test" ]; then
  echo "🧪 Testing Edge Function (dry-run, bypass quiet hours)..."
  echo ""
  
  # Test without any auth (should get 401 if verify_jwt=true, or warning if false)
  echo "   Test 1: No auth header..."
  RESP1=$(curl -s -w "\n%{http_code}" -X POST "$FUNCTION_URL" \
    -H 'Content-Type: application/json' \
    -d '{"dryRun": true, "bypassQuietHours": true}' 2>/dev/null)
  CODE1=$(echo "$RESP1" | tail -1)
  BODY1=$(echo "$RESP1" | sed '$d')
  echo "   Status: $CODE1"
  if [ "$CODE1" == "401" ]; then
    echo "   ❌ 401 UNAUTHORIZED - verify_jwt is likely TRUE in deployed config"
  elif [ "$CODE1" == "200" ]; then
    echo "   ✅ 200 OK - Function is accessible"
    echo "   Response: $(echo "$BODY1" | head -c 200)..."
  else
    echo "   ⚠️ Unexpected status: $CODE1"
  fi
  echo ""
fi

# Summary
echo "========================"
echo "✅ Verification complete"
echo ""
echo "Manual test commands:"
echo ""
echo "# Test without auth (check if 401):"
echo "curl -s -X POST '$FUNCTION_URL' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"dryRun\": true, \"bypassQuietHours\": true}'"
echo ""
echo "# Test with CRON_SECRET:"
echo "curl -s -X POST '$FUNCTION_URL' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'x-cron-secret: YOUR_CRON_SECRET' \\"
echo "  -d '{\"dryRun\": true, \"bypassQuietHours\": true}'"
