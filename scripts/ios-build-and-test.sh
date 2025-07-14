#!/bin/bash

# 🎯 M1SSION™ iOS Build & Test Automatico
# Sequence completa di build, sync e test

echo "🎯 M1SSION™ iOS Build & Test Sequence"
echo "======================================"

# Set error handling
set -e

# 1. Pre-build checks
echo ""
echo "🔍 Pre-build checks..."

if [ ! -f "package.json" ]; then
    echo "❌ package.json non trovato!"
    exit 1
fi

if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ capacitor.config.ts non trovato!"
    exit 1
fi

echo "✅ File configurazione OK"

# 2. Install dependencies se mancanti
if [ ! -d "node_modules" ]; then
    echo "📦 Installazione dipendenze..."
    npm install
fi

# 3. Build React app
echo ""
echo "🏗️  Building React app..."
npm run build

if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Build fallito - dist/index.html mancante!"
    exit 1
fi

echo "✅ Build React completato"

# 4. Check iOS project
if [ ! -d "ios" ]; then
    echo "📱 Creazione progetto iOS..."
    npx cap add ios
fi

# 5. Apply UIScene fix
echo ""
echo "🔧 Applicazione fix UIScene..."
INFO_PLIST="ios/App/App/Info.plist"

if [ -f "$INFO_PLIST" ]; then
    # Check if UIScene already exists
    if ! grep -q "UIApplicationSceneManifest" "$INFO_PLIST"; then
        echo "🔧 Aggiunta configurazione UIScene..."
        
        # Create UIScene config
        cat > /tmp/build_uiscene.xml << 'EOF'
	<!-- Auto-added UIScene Configuration -->
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
'"$(cat /tmp/build_uiscene.xml)"'
' "$INFO_PLIST"
        
        rm /tmp/build_uiscene.xml
        echo "✅ UIScene configurato"
    else
        echo "✅ UIScene già configurato"
    fi
else
    echo "❌ Info.plist non trovato!"
    exit 1
fi

# 6. Sync Capacitor
echo ""
echo "🔄 Capacitor sync..."
npx cap sync ios

# 7. Verify setup
echo ""
echo "🔍 Verifica finale..."

# Check critical files
CHECKS=(
    "ios/App/App.xcworkspace/contents.xcworkspacedata:Xcode Workspace"
    "ios/App/App/Info.plist:Info.plist"
    "dist/index.html:Build HTML"
    "dist/assets:Build Assets"
)

for check in "${CHECKS[@]}"; do
    file=$(echo "$check" | cut -d':' -f1)
    name=$(echo "$check" | cut -d':' -f2)
    
    if [ -e "$file" ]; then
        echo "✅ $name"
    else
        echo "❌ $name - mancante!"
        exit 1
    fi
done

# 8. Final status
echo ""
echo "🎉 BUILD COMPLETATO CON SUCCESSO!"
echo "================================="
echo ""
echo "📊 STATUS:"
echo "✅ React build: OK"
echo "✅ iOS project: OK"
echo "✅ UIScene fix: APPLICATO"
echo "✅ Capacitor sync: OK"
echo ""
echo "🚀 PROSSIMI PASSI:"
echo "1. npx cap open ios"
echo "2. In Xcode: seleziona device/simulator"
echo "3. Product → Run (⌘+R)"
echo ""
echo "🔍 DA MONITORARE IN XCODE CONSOLE:"
echo "• Dovrebbe sparire: 'CLIENT OF UIKIT REQUIRES UPDATE'"
echo "• Dovrebbe apparire: 'M1SSION APP OK' nei log"
echo "• App dovrebbe mostrare interfaccia invece di schermo nero"
echo ""
echo "⚠️  Se persiste schermo nero, controlla:"
echo "• Console Xcode per errori JavaScript"
echo "• Network tab per richieste fallite"
echo "• Permessi WKWebView"

# 9. Auto-open Xcode if requested
echo ""
read -p "🍎 Aprire Xcode ora? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Apertura Xcode..."
    npx cap open ios
fi

echo ""
echo "✨ Processo completato - $(date)"