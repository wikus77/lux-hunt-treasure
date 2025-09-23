#!/bin/bash
# © 2025 M1SSION™ - Build and deploy with custom SW
set -e

echo "🔧 Building M1SSION™ with anti-whitespace fix..."

# Build the app
npm run build

# Verify custom SW is in place
if [ -f "dist/sw.js" ]; then
  echo "✅ Custom SW found in dist/"
  
  # Check for our signature
  if grep -q "importScripts('sw-push.js')" dist/sw.js && grep -q "NetworkFirst" dist/sw.js; then
    echo "✅ Custom SW verified - contains push chain and NetworkFirst"
  else
    echo "❌ Custom SW verification failed - content mismatch"
    exit 1
  fi
else
  echo "❌ Custom SW not found in dist/"
  exit 1
fi

echo "🚀 Build completed successfully - ready for deploy"