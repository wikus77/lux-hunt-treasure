#!/bin/bash

# 🔍 M1SSION™ iOS Debug Completo
# Diagnostica tutti i problemi Capacitor iOS

echo "🔍 M1SSION™ iOS Debug Avanzato - Analisi completa..."

# Colors per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}🚀 M1SSION™ iOS DIAGNOSTIC TOOL${NC}"
echo -e "${BLUE}===========================================${NC}"

# 1. Verifica struttura progetto
echo -e "\n${YELLOW}📁 1. STRUTTURA PROGETTO${NC}"
echo "Root directory: $(pwd)"
echo "Package.json: $([ -f package.json ] && echo "✅ OK" || echo "❌ MANCANTE")"
echo "Capacitor config: $([ -f capacitor.config.ts ] && echo "✅ OK" || echo "❌ MANCANTE")"
echo "iOS folder: $([ -d ios ] && echo "✅ OK" || echo "❌ MANCANTE")"
echo "Dist folder: $([ -d dist ] && echo "✅ OK" || echo "❌ NON BUILDATO")"

# 2. Verifica Capacitor
echo -e "\n${YELLOW}📱 2. CAPACITOR STATUS${NC}"
if [ -f capacitor.config.ts ]; then
    echo "App ID: $(grep -o "appId: '[^']*'" capacitor.config.ts | cut -d"'" -f2)"
    echo "App Name: $(grep -o "appName: '[^']*'" capacitor.config.ts | cut -d"'" -f2)"
    echo "Web Dir: $(grep -o "webDir: '[^']*'" capacitor.config.ts | cut -d"'" -f2)"
fi

# 3. Verifica plugin installati
echo -e "\n${YELLOW}🔌 3. PLUGIN CAPACITOR${NC}"
REQUIRED_PLUGINS=("@capacitor/core" "@capacitor/ios" "@capacitor/splash-screen" "@capacitor/push-notifications" "@capacitor/haptics" "@capacitor/device" "@capacitor/network" "@capacitor/app")

for plugin in "${REQUIRED_PLUGINS[@]}"; do
    if npm list "$plugin" >/dev/null 2>&1; then
        VERSION=$(npm list "$plugin" --depth=0 | grep "$plugin" | cut -d'@' -f3)
        echo -e "✅ $plugin@$VERSION"
    else
        echo -e "❌ $plugin - NON INSTALLATO"
    fi
done

# 4. Verifica Info.plist UIScene
echo -e "\n${YELLOW}📋 4. INFO.PLIST iOS CONFIGURATION${NC}"
INFO_PLIST="ios/App/App/Info.plist"
if [ -f "$INFO_PLIST" ]; then
    echo "Info.plist: ✅ TROVATO"
    
    # Check UIScene
    if grep -q "UIApplicationSceneManifest" "$INFO_PLIST"; then
        echo "UIScene Lifecycle: ✅ CONFIGURATO"
    else
        echo -e "UIScene Lifecycle: ${RED}❌ MANCANTE - CAUSA SCHERMO NERO${NC}"
    fi
    
    # Check App Transport Security
    if grep -q "NSAppTransportSecurity" "$INFO_PLIST"; then
        echo "App Transport Security: ✅ CONFIGURATO"
    else
        echo "App Transport Security: ⚠️  NON CONFIGURATO"
    fi
    
    # Check WKWebView
    if grep -q "WKAppBoundDomains" "$INFO_PLIST"; then
        echo "WKWebView Domains: ✅ CONFIGURATO"
    else
        echo "WKWebView Domains: ⚠️  NON CONFIGURATO"
    fi
else
    echo -e "Info.plist: ${RED}❌ NON TROVATO${NC}"
fi

# 5. Verifica build
echo -e "\n${YELLOW}🏗️  5. BUILD STATUS${NC}"
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    INDEX_HTML=$([ -f "dist/index.html" ] && echo "✅" || echo "❌")
    echo "Dist folder: ✅ ($DIST_SIZE)"
    echo "Index.html: $INDEX_HTML"
    echo "Assets: $(find dist -name "*.js" -o -name "*.css" | wc -l) files"
else
    echo -e "Dist folder: ${RED}❌ NON BUILDATO${NC}"
fi

# 6. Verifica iOS project
echo -e "\n${YELLOW}🍎 6. XCODE PROJECT STATUS${NC}"
if [ -f "ios/App/App.xcworkspace/contents.xcworkspacedata" ]; then
    echo "Xcode Workspace: ✅ OK"
else
    echo -e "Xcode Workspace: ${RED}❌ CORROTTO${NC}"
fi

if [ -f "ios/App/Podfile.lock" ]; then
    echo "CocoaPods: ✅ INSTALLATO"
    echo "Pods: $(grep -c "SPEC CHECKSUMS" ios/App/Podfile.lock) installati"
else
    echo -e "CocoaPods: ${RED}❌ NON INSTALLATO${NC}"
fi

# 7. Comandi di riparazione
echo -e "\n${BLUE}===========================================${NC}"
echo -e "${BLUE}🔧 COMANDI DI RIPARAZIONE${NC}"
echo -e "${BLUE}===========================================${NC}"

echo -e "\n${YELLOW}Per risolvere UIScene (CRITICO):${NC}"
echo "chmod +x scripts/fix-ios-uiscene.sh && ./scripts/fix-ios-uiscene.sh"

echo -e "\n${YELLOW}Per reinstallare tutto:${NC}"
echo "rm -rf node_modules ios dist"
echo "npm install"
echo "npm run build"
echo "npx cap add ios"
echo "npx cap sync ios"

echo -e "\n${YELLOW}Per debug avanzato:${NC}"
echo "npx cap doctor"
echo "npx cap ls"

echo -e "\n${YELLOW}Per test su Xcode:${NC}"
echo "npx cap open ios"
echo "# Poi in Xcode: Product → Run, Monitor Console per errori"

# 8. Check final
echo -e "\n${BLUE}===========================================${NC}"
echo -e "${BLUE}📊 DIAGNOSI FINALE${NC}"
echo -e "${BLUE}===========================================${NC}"

ISSUES=0

# Count critical issues
if [ ! -f "$INFO_PLIST" ] || ! grep -q "UIApplicationSceneManifest" "$INFO_PLIST"; then
    echo -e "${RED}🚨 CRITICO: UIScene non configurato - CAUSA SCHERMO NERO${NC}"
    ((ISSUES++))
fi

if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo -e "${RED}🚨 CRITICO: Build mancante${NC}"
    ((ISSUES++))
fi

if ! npm list "@capacitor/core" >/dev/null 2>&1; then
    echo -e "${RED}🚨 CRITICO: Plugin Capacitor mancanti${NC}"
    ((ISSUES++))
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ Nessun problema critico rilevato${NC}"
    echo -e "${GREEN}L'app dovrebbe funzionare correttamente${NC}"
else
    echo -e "${RED}❌ $ISSUES problemi critici rilevati${NC}"
    echo -e "${YELLOW}Esegui i comandi di riparazione sopra indicati${NC}"
fi

echo -e "\n${BLUE}Fine diagnosi - $(date)${NC}"