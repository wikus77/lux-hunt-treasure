#!/bin/bash
# © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
# ROLLBACK SCRIPT: PWA Cron Audit (COMPREHENSIVE)
# Usage: ./scripts/rollback_pwa_cron.sh [--confirm]
#
# This script rolls back:
# - Git state to safe tag
# - Re-deploys the Edge Function from that state
# - Verifies the rollback was successful

set -e

TAG="pwa_cron_ok_20260123_1601"
FUNCTION_NAME="auto-push-cron"

# Safety check
if [ "$1" != "--confirm" ]; then
  echo "⚠️  ROLLBACK SCRIPT"
  echo ""
  echo "This will:"
  echo "  1. Reset git to tag: $TAG"
  echo "  2. Re-deploy Edge Function: $FUNCTION_NAME"
  echo ""
  echo "Run with --confirm to proceed:"
  echo "  ./scripts/rollback_pwa_cron.sh --confirm"
  exit 1
fi

echo "🔄 ROLLBACK: PWA CRON"
echo "===================="
echo "Target tag: $TAG"
echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# 1. Save current state for reference
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "detached")
CURRENT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
echo "📍 Current state:"
echo "   Branch: $CURRENT_BRANCH"
echo "   Commit: $CURRENT_COMMIT"
echo ""

# 2. Stash any uncommitted changes
if ! git diff --quiet 2>/dev/null; then
  echo "📦 Stashing uncommitted changes..."
  git stash push -m "rollback_pwa_cron_$(date +%Y%m%d_%H%M%S)"
fi

# 3. Checkout the safe tag
echo "🔄 Checking out safe tag: $TAG"
git checkout "$TAG"
echo ""

# 4. Verify we're at the right commit
echo "✅ Now at:"
echo "   Commit: $(git rev-parse --short HEAD)"
echo "   Tag: $(git describe --tags --exact-match 2>/dev/null || echo 'no tag')"
echo ""

# 5. Re-deploy the Edge Function
echo "🚀 Re-deploying Edge Function: $FUNCTION_NAME"
echo ""

# Check if supabase CLI is available
if command -v supabase &> /dev/null; then
  echo "   Using Supabase CLI..."
  supabase functions deploy "$FUNCTION_NAME" --no-verify-jwt 2>&1 || {
    echo "   ⚠️  Deploy failed - you may need to deploy manually:"
    echo "   supabase functions deploy $FUNCTION_NAME --no-verify-jwt"
  }
else
  echo "   ⚠️  Supabase CLI not found"
  echo "   Deploy manually with:"
  echo "   npx supabase functions deploy $FUNCTION_NAME --no-verify-jwt"
fi
echo ""

# 6. Verification
echo "🔍 Verifying rollback..."
if [ -f "./scripts/verify_pwa_cron.sh" ]; then
  chmod +x ./scripts/verify_pwa_cron.sh
  ./scripts/verify_pwa_cron.sh
fi

echo ""
echo "===================="
echo "✅ ROLLBACK COMPLETE"
echo ""
echo "To return to the fix branch:"
echo "   git checkout fix/pwa-cron-audit"
echo ""
echo "To restore stashed changes (if any):"
echo "   git stash pop"
