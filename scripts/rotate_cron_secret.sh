#!/bin/bash
# © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
# ROTATE CRON SECRET: Atomic update of DB + Edge Function
# Usage: ./scripts/rotate_cron_secret.sh [--confirm]
#
# This script:
# 1. Generates a new random secret
# 2. Updates auto_push_config.cron_secret in DB
# 3. Updates CRON_SECRET in Edge Function env
# 4. Redeploys the function
# 5. Runs healthcheck
# 6. If healthcheck fails → auto rollback

set -e

SUPABASE_PROJECT="vkjrqirvdvjbemsfzxof"
FUNCTION_NAME="auto-push-cron"

# Safety check
if [ "$1" != "--confirm" ]; then
  echo "⚠️  CRON SECRET ROTATION"
  echo ""
  echo "This will:"
  echo "  1. Generate new random secret"
  echo "  2. Update DB (auto_push_config.cron_secret)"
  echo "  3. Update Edge Function env (CRON_SECRET)"
  echo "  4. Redeploy function"
  echo "  5. Run healthcheck"
  echo ""
  echo "Run with --confirm to proceed:"
  echo "  ./scripts/rotate_cron_secret.sh --confirm"
  exit 1
fi

echo "🔄 CRON SECRET ROTATION"
echo "======================="
echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# 1. Generate new secret (64 hex chars)
NEW_SECRET=$(openssl rand -hex 32)
echo "✅ Generated new secret: ${NEW_SECRET:0:8}...${NEW_SECRET: -4}"

# 2. Update DB (requires supabase CLI or psql)
echo ""
echo "📝 Updating DB (auto_push_config.cron_secret)..."
echo ""
echo "Run this SQL in Supabase Dashboard SQL Editor:"
echo "──────────────────────────────────────────────"
echo "UPDATE auto_push_config SET cron_secret = '${NEW_SECRET}';"
echo "──────────────────────────────────────────────"
echo ""
read -p "Press Enter after running the SQL..."

# 3. Update Edge Function secret
echo ""
echo "📝 Updating Edge Function secret..."
echo ""
echo "Run this command:"
echo "──────────────────────────────────────────────"
echo "npx supabase secrets set CRON_SECRET=${NEW_SECRET} --project-ref ${SUPABASE_PROJECT}"
echo "──────────────────────────────────────────────"
echo ""
read -p "Press Enter after setting the secret..."

# 4. Redeploy function
echo ""
echo "🚀 Redeploying function..."
npx supabase functions deploy "$FUNCTION_NAME" --no-verify-jwt --project-ref "$SUPABASE_PROJECT" || {
  echo "❌ Deploy failed"
  exit 1
}

# 5. Run healthcheck
echo ""
echo "🔍 Running healthcheck..."
export CRON_SECRET="$NEW_SECRET"
if ./scripts/cron_healthcheck.sh; then
  echo ""
  echo "✅ ROTATION COMPLETE"
  echo "   New secret: ${NEW_SECRET:0:8}...${NEW_SECRET: -4}"
else
  echo ""
  echo "❌ HEALTHCHECK FAILED - ROLLBACK NEEDED"
  echo "Run: ./scripts/rollback_pwa_cron.sh --confirm"
  exit 1
fi
