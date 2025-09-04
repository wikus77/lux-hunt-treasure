#!/usr/bin/env bash
# © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
# Pre-deploy PWA guard script
set -euo pipefail

FILE="dist/index.html"

echo "🔍 Checking PWA requirements in $FILE..."

# Check for manifest
if ! grep -qi 'rel="manifest"' "$FILE"; then
    echo "❌ manifest missing in $FILE"
    exit 1
fi
echo "✅ manifest found"

# Check for Apple meta tags
if ! grep -qi 'apple-mobile-web-app-capable' "$FILE"; then
    echo "❌ apple meta missing in $FILE"
    exit 1
fi
echo "✅ apple meta found"

# Check for registerSW.js
if ! grep -qi 'registerSW.js' "$FILE"; then
    echo "❌ registerSW.js missing in $FILE"
    exit 1
fi
echo "✅ registerSW.js found"

# Check that _headers file exists in dist
if [ ! -f "dist/_headers" ]; then
    echo "❌ _headers file missing in dist/"
    exit 1
fi
echo "✅ _headers file found"

# Check that _redirects file exists in dist
if [ ! -f "dist/_redirects" ]; then
    echo "❌ _redirects file missing in dist/"
    exit 1
fi
echo "✅ _redirects file found"

echo "✅ PWA guard OK - all requirements met"