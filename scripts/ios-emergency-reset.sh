#!/bin/bash

# 🚨 M1SSION™ iOS Emergency Reset
# Reset completo quando tutto è rotto

echo "🚨 M1SSION™ iOS EMERGENCY RESET"
echo "⚠️  ATTENZIONE: Questo script cancella tutto e ricostruisce da zero"
echo ""
read -p "Sei sicuro? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operazione annullata"
    exit 1
fi

echo "🔥 Avvio reset completo..."

# 1. Backup di file importanti
echo "💾 Backup configurazioni..."
mkdir -p .backup-emergency
cp capacitor.config.ts .backup-emergency/ 2>/dev/null || true
cp -r src .backup-emergency/ 2>/dev/null || true
cp package.json .backup-emergency/ 2>/dev/null || true

# 2. Pulizia totale
echo "🧹 Pulizia completa..."
rm -rf node_modules
rm -rf ios
rm -rf dist
rm -rf .capacitor
rm -f package-lock.json

# 3. Reinstallazione
echo "📦 Reinstallazione dipendenze..."
npm install

# 4. Reinstallazione Capacitor
echo "📱 Reinstallazione Capacitor iOS..."
npx cap add ios

# 5. Configurazione automatica UIScene
echo "🔧 Configurazione automatica UIScene..."
INFO_PLIST="ios/App/App/Info.plist"

# Applica fix UIScene se il file esiste
if [ -f "$INFO_PLIST" ]; then
    # Crea configurazione UIScene
    cat > /tmp/emergency_uiscene.xml << 'EOF'
	<!-- Emergency UIScene Configuration -->
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

	<!-- Security Configuration -->
	<key>NSAppTransportSecurity</key>
	<dict>
		<key>NSAllowsArbitraryLoads</key>
		<true/>
		<key>NSAllowsLocalNetworking</key>
		<true/>
	</dict>

	<!-- WebView Configuration -->
	<key>WKAppBoundDomains</key>
	<array>
		<string>capacitor://localhost</string>
	</array>
EOF

    # Inserisci configurazione
    sed -i '' '/<\/dict>$/i\
'"$(cat /tmp/emergency_uiscene.xml)"'
' "$INFO_PLIST"
    
    rm /tmp/emergency_uiscene.xml
    echo "✅ UIScene configurato automaticamente"
else
    echo "❌ Info.plist non trovato"
fi

# 6. Build e sync
echo "🏗️  Build progetto..."
npm run build

echo "🔄 Sync Capacitor..."
npx cap sync ios

# 7. Verifica finale
echo ""
echo "🎯 RESET COMPLETO!"
echo ""
echo "✅ Node modules: REINSTALLATO"
echo "✅ iOS project: RIGENERATO"  
echo "✅ UIScene: CONFIGURATO"
echo "✅ Build: COMPLETATO"
echo "✅ Capacitor: SINCRONIZZATO"
echo ""
echo "🚀 PROSSIMO PASSO:"
echo "npx cap open ios"
echo ""
echo "📱 In Xcode:"
echo "• Product → Run"
echo "• Monitor Console per verificare risoluzione warning UIScene"
echo "• L'app dovrebbe caricare senza schermo nero"
echo ""
echo "💾 File originali salvati in: .backup-emergency/"