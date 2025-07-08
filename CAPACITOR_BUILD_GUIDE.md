# 📱 M1SSION™ - Guida Build Capacitor iOS

Questa guida spiega come buildare e deployare l'app M1SSION™ su iOS usando Capacitor.

## 🔧 Configurazione Completata

### ✅ Vite Config Ottimizzato
- **Base Path**: Configurato per asset statici (`./')
- **Target**: ES2015 per compatibilità iOS Safari
- **Output**: Ottimizzato per `/dist` con asset naming consistente
- **Chunks**: Suddivisione intelligente per performance

### ✅ Capacitor Config Ottimizzato  
- **webDir**: `dist` (output Vite)
- **iOS Scheme**: `M1SSION`
- **Background**: Nero per coerenza design
- **SplashScreen**: Configurata con branding M1SSION™

## 🚀 Comandi Build

### Build per Capacitor iOS
```bash
# Build produzione ottimizzato per iOS
npm run build:capacitor

# Sincronizza build con iOS
npm run cap:sync:ios

# Copia solo i file (senza sync plugins)
npm run cap:copy:ios

# Build + Sync + Run su simulatore/device
npm run cap:run:ios

# Apri progetto Xcode
npm run cap:open:ios
```

## 📋 Processo Completo Build

### 1. Prima configurazione (una volta sola)
```bash
# Inizializza Capacitor (se non fatto)
npm run cap:init

# Aggiungi platform iOS
npm run cap:add:ios
```

### 2. Build per produzione
```bash
# Build completo per iOS
npm run cap:sync:ios
```

### 3. Deploy su device fisico
```bash
# Apri Xcode e configura:
# - Team Developer
# - Bundle Identifier 
# - Provisioning Profile
npm run cap:open:ios
```

## 🎯 Ottimizzazioni Implementate

### Routing Statico
- ✅ Rimossi tutti i `lazy imports`
- ✅ Import statici per compatibilità Capacitor
- ✅ Routing ottimizzato per `capacitor://localhost`

### Asset Management  
- ✅ Asset naming consistente con hash
- ✅ CSS bundling unificato per iOS
- ✅ Ottimizzazione chunks per ridurre caricamenti

### Performance iOS
- ✅ Target ES2015 per Safari iOS
- ✅ Global polyfill per compatibilità
- ✅ Exclude @capacitor/core da Vite optimize

## 🔍 Testing su iOS

### Simulatore iOS
```bash
npm run cap:run:ios
# Seleziona simulatore dal menu Xcode
```

### Device Fisico
1. Connetti iPhone/iPad via USB
2. Apri Xcode: `npm run cap:open:ios`
3. Seleziona device fisico
4. Configura certificati Apple Developer
5. Build & Run da Xcode

## 📁 Struttura Output

```
dist/
├── index.html          # Entry point iOS app
├── assets/            
│   ├── *.js           # JavaScript chunks
│   ├── *.css          # Styles bundle
│   └── *.png/.jpg     # Immagini/icone
└── manifest.json      # PWA manifest
```

## ⚠️ Note Importanti

- **Server Config**: Commentata per build produzione
- **Dynamic Imports**: Completamente rimossi
- **Base Path**: Configurato per asset relativi iOS
- **iOS Safe Area**: Supportata nativamente

## 🎉 Pronto per Production

La configurazione è completamente ottimizzata per:
- ✅ Build statici compatibili Capacitor
- ✅ Performance iOS native
- ✅ Asset loading ottimizzato
- ✅ Routing funzionante su `capacitor://`

Esegui `npm run cap:sync:ios` per iniziare! 🚀