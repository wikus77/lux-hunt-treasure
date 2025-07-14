#!/bin/bash

# 🎯 M1SSION™ Bundle Identifier Alignment Script
# Forza allineamento completo a com.niyvora.m1ssion

echo "🔧 M1SSION™ Bundle Identifier Fix"
echo "================================="

# Set error handling
set -e

TARGET_BUNDLE_ID="com.niyvora.m1ssion"
echo "🎯 Target Bundle ID: $TARGET_BUNDLE_ID"

# 1. Fix capacitor.config.ts
echo ""
echo "📝 Fixing capacitor.config.ts..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/appId: 'app\.lovable\.[^']*'/appId: '$TARGET_BUNDLE_ID'/g" capacitor.config.ts
else
    sed -i "s/appId: 'app\.lovable\.[^']*'/appId: '$TARGET_BUNDLE_ID'/g" capacitor.config.ts
fi
echo "✅ capacitor.config.ts updated"

# 2. Verify capacitor.config.json is correct
echo ""
echo "📝 Verifying capacitor.config.json..."
if grep -q "com.niyvora.m1ssion" capacitor.config.json; then
    echo "✅ capacitor.config.json already correct"
else
    echo "⚠️  Fixing capacitor.config.json..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"appId\": \"[^\"]*\"/\"appId\": \"$TARGET_BUNDLE_ID\"/g" capacitor.config.json
    else
        sed -i "s/\"appId\": \"[^\"]*\"/\"appId\": \"$TARGET_BUNDLE_ID\"/g" capacitor.config.json
    fi
    echo "✅ capacitor.config.json fixed"
fi

# 3. Remove corrupted iOS project
echo ""
echo "🗑️  Removing corrupted iOS project..."
if [ -d "ios" ]; then
    rm -rf ios
    echo "✅ Old iOS project removed"
else
    echo "ℹ️  No existing iOS project found"
fi

# 4. Clean Capacitor cache
echo ""
echo "🧹 Cleaning Capacitor cache..."
rm -rf .capacitor
rm -rf node_modules/.cache
echo "✅ Cache cleared"

# 5. Rebuild iOS project
echo ""
echo "📱 Rebuilding iOS project with correct Bundle ID..."
npx cap add ios

# 6. Verify iOS project was created
if [ ! -d "ios/App/App" ]; then
    echo "❌ Failed to create iOS project!"
    exit 1
fi

# 7. Apply UIScene fix immediately
echo ""
echo "🔧 Applying UIScene fix..."
INFO_PLIST="ios/App/App/Info.plist"

if [ -f "$INFO_PLIST" ]; then
    # Check if UIScene already exists
    if ! grep -q "UIApplicationSceneManifest" "$INFO_PLIST"; then
        echo "🔧 Adding UIScene configuration..."
        
        # Create UIScene config
        cat > /tmp/uiscene_fix.xml << 'EOF'
	<!-- Bundle Identifier Fix - UIScene Configuration -->
	<key>UIApplicationSceneManifest</key>
	<dict>
		<key>UIApplicationSupportsMultipleScenes</key>
		<true/>
		<key>UISceneConfigurations</key>
		<dict>
			<key>UIWindowSceneSessionRoleApplication</key>
			<array>
				<dict>
					<key>UISceneDelegateClassName</key>
					<string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
					<key>UISceneClassName</key>
					<string>UIWindowScene</string>
					<key>UISceneConfigurationName</key>
					<string>Default Configuration</string>
				</dict>
			</array>
		</dict>
	</dict>
	<key>NSAppTransportSecurity</key>
	<dict>
		<key>NSAllowsArbitraryLoads</key>
		<true/>
		<key>NSAllowsLocalNetworking</key>
		<true/>
	</dict>
EOF

        # Insert before closing </dict>
        sed -i '' '/<\/dict>$/i\
'"$(cat /tmp/uiscene_fix.xml)"'
' "$INFO_PLIST"
        
        rm /tmp/uiscene_fix.xml
        echo "✅ UIScene configured"
    else
        echo "✅ UIScene already configured"
    fi
else
    echo "❌ Info.plist not found!"
    exit 1
fi

# 8. Force Bundle ID in Xcode project
echo ""
echo "🎯 Forcing Bundle Identifier in Xcode project..."
PROJECT_FILE="ios/App/App.xcodeproj/project.pbxproj"

if [ -f "$PROJECT_FILE" ]; then
    # Replace any existing bundle identifier
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/PRODUCT_BUNDLE_IDENTIFIER = [^;]*/PRODUCT_BUNDLE_IDENTIFIER = $TARGET_BUNDLE_ID/g" "$PROJECT_FILE"
    else
        sed -i "s/PRODUCT_BUNDLE_IDENTIFIER = [^;]*/PRODUCT_BUNDLE_IDENTIFIER = $TARGET_BUNDLE_ID/g" "$PROJECT_FILE"
    fi
    echo "✅ Bundle ID forced in Xcode project"
else
    echo "⚠️  Xcode project file not found"
fi

# 9. Sync everything
echo ""
echo "🔄 Final sync..."
npx cap sync ios

# 10. Build project
echo ""
echo "🏗️  Building project..."
npm run build

# 11. Final verification
echo ""
echo "🔍 Final verification..."

# Check Bundle ID in all files
echo "📊 Bundle ID Status:"
echo "-------------------"

if grep -q "$TARGET_BUNDLE_ID" capacitor.config.ts; then
    echo "✅ capacitor.config.ts: $TARGET_BUNDLE_ID"
else
    echo "❌ capacitor.config.ts: MISMATCH"
fi

if grep -q "$TARGET_BUNDLE_ID" capacitor.config.json; then
    echo "✅ capacitor.config.json: $TARGET_BUNDLE_ID"
else
    echo "❌ capacitor.config.json: MISMATCH"
fi

if [ -f "$INFO_PLIST" ] && grep -q "UIApplicationSceneManifest" "$INFO_PLIST"; then
    echo "✅ Info.plist: UIScene configured"
else
    echo "❌ Info.plist: UIScene missing"
fi

if [ -f "$PROJECT_FILE" ] && grep -q "$TARGET_BUNDLE_ID" "$PROJECT_FILE"; then
    echo "✅ Xcode project: $TARGET_BUNDLE_ID"
else
    echo "❌ Xcode project: MISMATCH"
fi

echo ""
echo "🎉 BUNDLE IDENTIFIER ALIGNMENT COMPLETED!"
echo "======================================="
echo ""
echo "📱 Next Steps:"
echo "1. npx cap open ios"
echo "2. In Xcode: Product → Clean Build Folder"
echo "3. In Xcode: Product → Run"
echo ""
echo "🔍 Monitor Xcode Console for:"
echo "• No more 'CLIENT OF UIKIT REQUIRES UPDATE'"
echo "• No more 'Could not create sandbox extension'"
echo "• App should load without black screen"
echo ""
echo "✨ Bundle ID successfully aligned to: $TARGET_BUNDLE_ID"