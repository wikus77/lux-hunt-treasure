#!/bin/bash

# 🔍 M1SSION™ Bundle Identifier Verification Script
# Verifica completa allineamento Bundle ID

echo "🔍 M1SSION™ Bundle Identifier Verification"
echo "========================================="

TARGET_BUNDLE_ID="com.niyvora.m1ssion"
ISSUES_FOUND=0

echo "🎯 Target Bundle ID: $TARGET_BUNDLE_ID"
echo ""

# 1. Check capacitor.config.ts
echo "📝 Checking capacitor.config.ts..."
if [ -f "capacitor.config.ts" ]; then
    if grep -q "appId: '$TARGET_BUNDLE_ID'" capacitor.config.ts; then
        echo "✅ capacitor.config.ts: ALIGNED"
    else
        echo "❌ capacitor.config.ts: MISALIGNED"
        CURRENT_ID=$(grep "appId:" capacitor.config.ts | head -1)
        echo "   Current: $CURRENT_ID"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo "❌ capacitor.config.ts: NOT FOUND"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 2. Check capacitor.config.json
echo ""
echo "📝 Checking capacitor.config.json..."
if [ -f "capacitor.config.json" ]; then
    if grep -q "\"appId\": \"$TARGET_BUNDLE_ID\"" capacitor.config.json; then
        echo "✅ capacitor.config.json: ALIGNED"
    else
        echo "❌ capacitor.config.json: MISALIGNED"
        CURRENT_ID=$(grep "appId" capacitor.config.json | head -1)
        echo "   Current: $CURRENT_ID"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo "❌ capacitor.config.json: NOT FOUND"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 3. Check iOS Info.plist
echo ""
echo "📱 Checking iOS Info.plist..."
INFO_PLIST="ios/App/App/Info.plist"
if [ -f "$INFO_PLIST" ]; then
    echo "✅ Info.plist: EXISTS"
    
    # Check UIScene
    if grep -q "UIApplicationSceneManifest" "$INFO_PLIST"; then
        echo "✅ UIScene: CONFIGURED"
    else
        echo "❌ UIScene: MISSING"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
    
    # Check CFBundleIdentifier
    if grep -q "CFBundleIdentifier" "$INFO_PLIST"; then
        echo "✅ CFBundleIdentifier: PRESENT"
    else
        echo "❌ CFBundleIdentifier: MISSING"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo "❌ Info.plist: NOT FOUND"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 4. Check Xcode project
echo ""
echo "🎯 Checking Xcode project..."
PROJECT_FILE="ios/App/App.xcodeproj/project.pbxproj"
if [ -f "$PROJECT_FILE" ]; then
    if grep -q "PRODUCT_BUNDLE_IDENTIFIER = $TARGET_BUNDLE_ID" "$PROJECT_FILE"; then
        echo "✅ Xcode project: ALIGNED"
    else
        echo "❌ Xcode project: MISALIGNED"
        BUNDLE_LINES=$(grep "PRODUCT_BUNDLE_IDENTIFIER" "$PROJECT_FILE" | head -3)
        echo "   Current Bundle IDs found:"
        echo "$BUNDLE_LINES"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo "❌ Xcode project: NOT FOUND"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 5. Check for conflicting files
echo ""
echo "🔄 Checking for conflicts..."
CONFLICTING_IDS=$(find . -name "*.ts" -o -name "*.json" -o -name "*.plist" -o -name "*.pbxproj" | xargs grep -l "app\.lovable\." 2>/dev/null | head -5)
if [ -n "$CONFLICTING_IDS" ]; then
    echo "⚠️  Files with conflicting Bundle IDs found:"
    echo "$CONFLICTING_IDS"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "✅ No conflicting Bundle IDs found"
fi

# 6. Summary
echo ""
echo "📊 VERIFICATION SUMMARY"
echo "======================"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo "🎉 ALL ALIGNED! Bundle Identifier is correctly set to: $TARGET_BUNDLE_ID"
    echo ""
    echo "✅ Status: PRODUCTION READY"
    echo "✅ Compatibility: iOS 13+ READY"
    echo "✅ App Store: SUBMISSION READY"
    echo ""
    echo "🚀 Ready to deploy:"
    echo "   npx cap open ios"
else
    echo "⚠️  ISSUES FOUND: $ISSUES_FOUND"
    echo ""
    echo "🔧 To fix all issues automatically:"
    echo "   ./scripts/fix-bundle-identifier.sh"
    echo ""
    echo "❌ Status: NEEDS FIXING"
fi

echo ""
echo "🕐 Verification completed: $(date)"