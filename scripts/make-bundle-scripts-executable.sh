#!/bin/bash

# Make all bundle identifier scripts executable
chmod +x scripts/fix-bundle-identifier.sh
chmod +x scripts/verify-bundle-alignment.sh

echo "✅ Bundle identifier scripts are now executable"
echo ""
echo "🔧 Available commands:"
echo "   ./scripts/verify-bundle-alignment.sh    # Check current status"
echo "   ./scripts/fix-bundle-identifier.sh      # Fix all issues automatically"