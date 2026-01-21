#!/bin/bash
# © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
# iOS Post-Sync Script - Injects safe-area CSS into iOS bundle
# Run this after: npx cap sync ios

set -e

IOS_INDEX="ios/App/App/public/index.html"

# Check if file exists
if [ ! -f "$IOS_INDEX" ]; then
    echo "❌ iOS index.html not found at $IOS_INDEX"
    exit 1
fi

# Check if already injected
if grep -q "capacitor-ios-safearea" "$IOS_INDEX"; then
    echo "✅ Safe-area CSS already present in iOS index.html"
    exit 0
fi

# Inject CSS after <head> tag
sed -i '' 's|<head>|<head>\
    <!-- M1SSION™ Capacitor iOS Safe-Area Fix - WRAP ONLY -->\
    <style id="capacitor-ios-safearea">\
      /* Injected at build time for iOS Capacitor wrapper */\
      html { --capacitor-safe-top: env(safe-area-inset-top, 59px); }\
      .unified-header-wrapper { padding-top: calc(env(safe-area-inset-top, 59px) + 12px) !important; }\
    </style>|' "$IOS_INDEX"

echo "✅ M1SSION™: Safe-area CSS injected into iOS bundle"

