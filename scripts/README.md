
# 🔧 Script Reset Password Developer M1SSION™

## 📋 Setup Prerequisiti

1. **Installa dipendenze:**
```bash
cd scripts
npm install
```

2. **Configura variabile ambiente:**
```bash
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

## 🚀 Esecuzione Script

### Metodo 1: Script diretto
```bash
cd scripts
npm run reset-password
```

### Metodo 2: Con variabile inline
```bash
cd scripts
SUPABASE_SERVICE_ROLE_KEY="your-key" npm run reset-dev
```

### Metodo 3: Esecuzione diretta
```bash
cd scripts
SUPABASE_URL=https://vkjrqirvdvjbemsfzxof.supabase.co SUPABASE_SERVICE_ROLE_KEY="your-key" npx tsx reset-password.ts
```

## 📊 Output Atteso

```
🔧 RESET PASSWORD DEVELOPER - INIZIO
📧 Email: wikus77@hotmail.it
🔐 Nuova password: Wikus190877!@#
👤 ID Utente trovato: xxx-xxx-xxx
✅ PASSWORD AGGIORNATA CON SUCCESSO
📧 Email utente: wikus77@hotmail.it
✅ Email già confermata: 2025-06-14T...
🔍 VERIFICA RUOLO DEVELOPER
✅ Ruolo DEVELOPER confermato
🏁 SCRIPT COMPLETATO
```

## 🧪 Test Post-Reset

Dopo l'esecuzione dello script:

1. Vai su `/login`
2. Clicca "🔧 Developer: Compila credenziali test"
3. Clicca "Accedi"
4. Verifica login riuscito

## 🚨 Troubleshooting

- **Errore SUPABASE_SERVICE_ROLE_KEY**: Verifica la variabile ambiente
- **Utente non trovato**: Controlla che l'email esista in auth.users
- **Errore permessi**: Verifica che il service role key sia corretto

## 🔍 Debug

Il LoginDebugHelper mostra in tempo reale:
- Stato sessione attiva/inattiva
- Token access e refresh
- Scadenza token
- Log di autenticazione

Visibile in `/login` con parametro `?debug=1` o in development mode.
