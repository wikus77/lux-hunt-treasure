#!/bin/bash
# © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
# iOS Post-Sync Script - Injects safe-area CSS + Capacitor marker into iOS bundle

set -e

IOS_INDEX="ios/App/App/public/index.html"

if [ ! -f "$IOS_INDEX" ]; then
    echo "❌ iOS index.html not found"
    exit 1
fi

# Remove old injection if present (for clean re-injection)
if grep -q "capacitor-ios-safearea" "$IOS_INDEX"; then
    echo "🔄 Removing old CSS injection..."
    # Remove the old style tag
    sed -i '' 's|<style id="capacitor-ios-safearea">[^<]*</style>||g' "$IOS_INDEX"
fi

# CSS injection - comprehensive safe-area fix for all headers
# Also adds data-capacitor attribute for JS detection
CSS_INJECTION='<style id="capacitor-ios-safearea">:root{--cap-safe-top:env(safe-area-inset-top,59px);--cap-header-offset:calc(env(safe-area-inset-top,59px)+12px)}.unified-header-wrapper{padding-top:var(--cap-header-offset)!important}#mission-header-container{padding-top:var(--cap-safe-top)!important}[style*="position: fixed"][style*="top: 0"],[style*="position:fixed"][style*="top:0"]{padding-top:var(--cap-safe-top)!important}html{--capacitor-native:1}</style><script>window.__CAPACITOR_NATIVE__=true;document.documentElement.dataset.capacitor="true";</script>'

sed -i '' "s|<head>|<head>${CSS_INJECTION}|" "$IOS_INDEX"

echo "✅ M1SSION™: Safe-area CSS + Capacitor marker injected"
