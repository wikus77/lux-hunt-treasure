#!/bin/bash

# 🚨 SCRIPT AUTOMATICO - Fix UIScene iOS per M1SSION™
# Risolve: "CLIENT OF UIKIT REQUIRES UPDATE: This process does not adopt UIScene lifecycle"

echo "🔧 M1SSION™ iOS UIScene Fix - Avvio automatico..."

# Check if Info.plist exists
INFO_PLIST="ios/App/App/Info.plist"
if [ ! -f "$INFO_PLIST" ]; then
    echo "❌ ERRORE: $INFO_PLIST non trovato!"
    echo "💡 Esegui prima: npx cap add ios"
    exit 1
fi

echo "📱 Trovato Info.plist: $INFO_PLIST"

# Backup originale
cp "$INFO_PLIST" "$INFO_PLIST.backup"
echo "💾 Backup creato: $INFO_PLIST.backup"

# Crea il nuovo contenuto UIScene
cat > /tmp/uiscene_config.xml << 'EOF'
	<!-- UIScene Configuration for iOS 13+ -->
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

	<!-- Enhanced App Transport Security -->
	<key>NSAppTransportSecurity</key>
	<dict>
		<key>NSAllowsArbitraryLoads</key>
		<true/>
		<key>NSAllowsLocalNetworking</key>
		<true/>
	</dict>

	<!-- WKWebView Enhanced Configuration -->
	<key>WKAppBoundDomains</key>
	<array>
		<string>capacitor://localhost</string>
	</array>
EOF

# Verifica se UIScene è già presente
if grep -q "UIApplicationSceneManifest" "$INFO_PLIST"; then
    echo "⚠️  UIScene già presente - rimuovo versione esistente..."
    # Rimuovi la sezione esistente (tra UIApplicationSceneManifest e </dict>)
    sed -i '' '/UIApplicationSceneManifest/,/<\/dict>/d' "$INFO_PLIST"
fi

# Inserisci la nuova configurazione prima del tag di chiusura finale
sed -i '' '/<\/dict>$/i\
'"$(cat /tmp/uiscene_config.xml)"'
' "$INFO_PLIST"

# Pulizia
rm /tmp/uiscene_config.xml

echo "✅ UIScene configurazione aggiunta con successo!"

# Verifica configurazione
echo "🔍 Verifica configurazione:"
if grep -q "UIApplicationSceneManifest" "$INFO_PLIST"; then
    echo "✅ UIScene: CONFIGURATO"
else
    echo "❌ UIScene: ERRORE"
    exit 1
fi

if grep -q "NSAppTransportSecurity" "$INFO_PLIST"; then
    echo "✅ App Transport Security: CONFIGURATO"
else
    echo "❌ App Transport Security: MANCANTE"
fi

echo ""
echo "🎯 PROSSIMI PASSI AUTOMATICI:"
echo "1. npm run build"
echo "2. npx cap sync ios"  
echo "3. npx cap open ios"
echo ""
echo "📱 Test da Xcode:"
echo "• Console: dovrebbe sparire warning UIScene"
echo "• App: dovrebbe caricare correttamente"
echo "• WebView: dovrebbe mostrare interfaccia React"

exit 0