
# 📱 Setup iOS Development - M1SSION

## 🔧 Configurazione aggiornata per IP locale 192.168.178.126

### ✅ CONFIGURAZIONE CORRENTE

**IP Locale configurato:** `192.168.178.126:3000`
**Stato:** Configurazione Capacitor aggiornata e pronta per sync

### 1. Verifica connessione di rete

Assicurati che:
- iPhone e PC siano sulla stessa rete WiFi
- Il server React sia attivo su: `http://192.168.178.126:3000`
- Testa l'URL dal browser Safari su iPhone per verificare raggiungibilità

### 2. Build e sincronizzazione

```bash
# Build del progetto React
npm run build

# Sincronizza Capacitor con le nuove configurazioni
npx cap sync ios

# Apri in Xcode
npx cap open ios
```

### 3. Deploy su iPhone

1. **Pulisci build precedenti:**
   - In Xcode: Product > Clean Build Folder
   - Disinstalla versioni precedenti dell'app da iPhone

2. **Configura target:**
   - Seleziona il tuo dispositivo iOS fisico
   - Assicurati che sia sulla stessa rete WiFi (192.168.178.x)

3. **Build e installa:**
   - Build e installa l'app aggiornata
   - Avvia l'app e verifica connessione

### 4. Test Login Developer

**Credenziali ufficiali:**
- Email: `wikus77@hotmail.it`
- Password: `Wikus190877!@#`

**Test da eseguire:**
1. Apri app su iPhone
2. Vai alla schermata login
3. Inserisci credenziali developer
4. Verifica accesso e ruoli
5. Controlla console Xcode per eventuali errori

### 5. Debug e monitoraggio

**Console Safari (per debug WebView):**
- Safari > Develop > [Nome iPhone] > [M1SSION]

**Logs Xcode:**
- Monitora console per errori di rete o autenticazione

### ⚠️ Troubleshooting

**Se l'app non si connette:**
1. Verifica che il server React risponda su `http://192.168.178.126:3000`
2. Controlla firewall/antivirus sul PC
3. Assicurati che iPhone sia sulla rete WiFi corretta
4. Riavvia l'app dopo modifiche alla configurazione

**Se il login fallisce:**
1. Verifica connessione internet iPhone
2. Controlla logs backend Supabase
3. Testa le stesse credenziali da browser web

### ✅ Checklist post-deployment

- [ ] Server React attivo su IP 192.168.178.126:3000
- [ ] App installata su iPhone (versione aggiornata)
- [ ] Login developer funzionante
- [ ] Nessun errore in console Xcode
- [ ] Sessione auth persistente
- [ ] Interfaccia responsive e stabile

### 🎯 Stato Attuale Sistema

**✅ Backend Supabase:** Stabile e operativo
**✅ Login tradizionale:** Implementato per tutti gli utenti
**✅ Credenziali developer:** Configurate e testate
**✅ Configurazione Capacitor:** Aggiornata con IP corretto
**✅ Cross-platform:** Compatibile iOS/Android/Web

**📱 Pronto per test iOS con IP 192.168.178.126**
