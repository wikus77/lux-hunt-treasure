#!/bin/bash
# © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
# iOS Post-Sync Script - Injects safe-area CSS into iOS bundle

set -e

IOS_INDEX="ios/App/App/public/index.html"

if [ ! -f "$IOS_INDEX" ]; then
    echo "❌ iOS index.html not found"
    exit 1
fi

if grep -q "capacitor-ios-safearea" "$IOS_INDEX"; then
    echo "✅ Safe-area CSS already present"
    exit 0
fi

# Use sed with inline CSS (single line for compatibility)
sed -i '' 's|<head>|<head><style id="capacitor-ios-safearea">:root{--capacitor-safe-top:env(safe-area-inset-top,59px);--header-safe-offset:calc(env(safe-area-inset-top,59px)+12px)}.unified-header-wrapper{padding-top:var(--header-safe-offset)!important}#mission-header-container{padding-top:var(--capacitor-safe-top)!important}</style>|' "$IOS_INDEX"

echo "✅ M1SSION™: Safe-area CSS injected"
