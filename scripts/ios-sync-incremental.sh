#!/usr/bin/env bash
# © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
# iOS incremental sync: dist/ → ios/App/App/public without full remove+copy.
# Preserves mtimes of unchanged files so Xcode Copy Bundle Resources can stay incremental.
# Use this instead of "npx cap sync ios" for local iOS dev to avoid 30–40 min builds.

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="${ROOT}/dist"
PUBLIC="${ROOT}/ios/App/App/public"

if [ ! -d "$DIST" ]; then
  echo "❌ dist/ not found. Run: npm run build"
  exit 1
fi

# Incremental sync: copy only when content differs (--checksum), preserve mtimes (-a).
# --delete: remove files in public that no longer exist in dist (controlled).
# Trailing slashes: contents of dist → contents of public.
echo "📦 [ios-sync-incremental] Syncing dist/ → ios/App/App/public (incremental, checksum-based)"
rsync -a --delete --checksum "$DIST/" "$PUBLIC/"

# Apply project-specific post-sync injection (safe-area CSS, Capacitor marker).
if [ -f "${ROOT}/scripts/ios-post-sync.sh" ]; then
  "${ROOT}/scripts/ios-post-sync.sh"
fi

echo "✅ [ios-sync-incremental] Done. Run: npx cap update ios (if needed for plugins/config)"
