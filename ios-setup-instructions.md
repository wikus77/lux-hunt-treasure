
# 📱 Setup iOS Development - M1SSION

## 🔧 Configurazione rapida per sviluppo iOS

### 1. Trova l'IP locale del tuo computer

**Mac:**
```bash
ipconfig getifaddr en0
```

**Windows:**
```bash
ipconfig | findstr IPv4
```

**Linux:**
```bash
hostname -I
```

### 2. Aggiorna configurazione Capacitor

Modifica `capacitor.config.ts` sostituendo `192.168.1.100` con il tuo IP locale:

```typescript
server: {
  url: 'http://TUO_IP_LOCALE:8080',
  cleartext: true,
  androidScheme: 'https'
}
```

### 3. Avvia server React

```bash
npm run dev
```

Verifica che il server sia raggiungibile da browser su: `http://TUO_IP_LOCALE:8080`

### 4. Sincronizza Capacitor

```bash
npm run build
npx cap sync ios
```

### 5. Apri in Xcode

```bash
npx cap open ios
```

### 6. Build e Deploy

1. In Xcode: Product > Clean Build Folder
2. Seleziona il tuo dispositivo iOS fisico
3. Build e installa l'app

## ⚠️ Risoluzione problemi comuni

### Errore di connessione
- Verifica che iPhone e PC siano sulla stessa rete WiFi
- Controlla firewall del PC (deve permettere connessioni porta 8080)
- Testa l'URL dal browser Safari su iPhone

### Firewall Mac
```bash
sudo pfctl -d  # Disabilita temporaneamente
```

### Firewall Windows
Aggiungi eccezione per porta 8080 in Windows Defender

### Debug WebView
Apri Safari > Develop > [Nome iPhone] > [M1SSION] per ispezionare WebView

## ✅ Checklist verifica

- [ ] IP locale identificato correttamente
- [ ] Server React attivo su porta 8080
- [ ] URL testato da browser iPhone
- [ ] Firewall configurato per porta 8080
- [ ] Dispositivi sulla stessa rete WiFi
- [ ] Capacitor sincronizzato
- [ ] Build Xcode pulita
- [ ] App installata su dispositivo fisico

## 🔄 Script automatico setup

```bash
#!/bin/bash
# Ottieni IP automaticamente e aggiorna config
IP=$(ipconfig getifaddr en0)
echo "IP locale rilevato: $IP"

# Backup configurazione esistente
cp capacitor.config.ts capacitor.config.ts.backup

# Aggiorna configurazione con IP dinamico
sed -i '' "s/192\.168\.1\.100/$IP/g" capacitor.config.ts

echo "Configurazione aggiornata con IP: $IP"
echo "Esegui: npm run build && npx cap sync ios"
```
