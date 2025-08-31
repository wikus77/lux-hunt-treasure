# 🔧 M1SSION™ Push Health Diagnostic

## Accesso alla Pagina
- **URL Produzione**: https://m1ssion.eu/push-health
- **URL Sviluppo**: http://localhost:5173/push-health
- **Health Check Statico**: https://m1ssion.eu/push-health.txt → "OK"

## Funzionalità Principali

### 🚦 Checklist di Sistema
- ✅ **Feature Detection**: ServiceWorker, PushManager, Notification API
- ⚙️ **Service Worker Status**: Registrazione, stato, import di sw-push.js
- 📱 **Subscription Status**: Endpoint, chiavi, host detection
- 🔧 **Backend Tests**: push_subscribe e push_send

### 🛠️ Kill Switch
- **Attivazione**: `?__noPush=1` nell'URL o `localStorage.setItem('push:disable','1')`
- **Disattivazione**: Pulsante nella pagina o `localStorage.removeItem('push:disable')`

### 📊 Diagnostic Features
1. **Feature Support Check**: Verifica compatibilità browser
2. **SW Registration**: Controllo registrazioni attive e stato
3. **SW Import Check**: Verifica che sw.js importi sw-push.js
4. **Subscription Management**: Visualizza, copia JSON, (ri-)subscribe
5. **Backend Testing**: Test end-to-end con Supabase Edge Functions
6. **Live Logging**: Console in tempo reale con tutti i test

### 🎯 Endpoint Detection
- **iOS (APNs)**: `web.push.apple.com` o `api.push.apple.com`
- **Chrome/Android (FCM)**: `fcm.googleapis.com`
- **Windows (WNS)**: `wns.notify.windows.com`

## Service Worker Status

Il Service Worker ora importa sempre sw-push.js senza try/catch per garantire che il push funzioni:
```javascript
// SW IMPORT sw-push.js ✅ 2025-08-31T06:40:00.000Z
importScripts('/sw-push.js');
```

## Database Schema

La tabella `push_subscriptions` ha questa struttura:
```sql
CREATE TABLE public.push_subscriptions (
  endpoint text PRIMARY KEY,
  user_id uuid NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text NULL,
  platform text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

## Comandi CLI di Verifica

```bash
# 1. Verifica che SW importi sw-push.js
curl -sS https://m1ssion.eu/sw.js | grep -q "importScripts('/sw-push.js')" && echo "✅ SW Import OK" || echo "❌ SW Import MISSING"

# 2. Verifica che sw-push.js esista
curl -sS https://m1ssion.eu/sw-push.js >/dev/null && echo "✅ sw-push.js OK" || echo "❌ sw-push.js MISSING"

# 3. Verifica pagina push-health
curl -sS https://m1ssion.eu/push-health | grep -q "Push Health" && echo "✅ Page OK" || echo "❌ Page MISSING"

# 4. Verifica health check statico
curl -sS https://m1ssion.eu/push-health.txt

# 5. Lista ultime subscription
SUPA_URL="https://vkjrqirvdvjbemsfzxof.supabase.co"
SUPA_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk"
curl -sS "$SUPA_URL/rest/v1/push_subscriptions?select=endpoint,created_at,platform&order=created_at.desc&limit=5" \
  -H "apikey: $SUPA_ANON" -H "Authorization: Bearer $SUPA_ANON" | jq .
```

## Edge Functions Testing

### push_subscribe
```bash
curl -X POST https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/push_subscribe \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk" \
  -d '{
    "endpoint": "https://web.push.apple.com/...",
    "keys": {
      "p256dh": "base64_encoded_key",
      "auth": "base64_encoded_key"
    },
    "ua": "Mozilla/5.0...",
    "platform": "iOS"
  }'
```

### push_send
```bash
curl -X POST https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/push_send \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk" \
  -d '{
    "endpoint": "https://web.push.apple.com/...",
    "payload": {
      "title": "Test",
      "body": "Push notification test",
      "data": {"url": "/"}
    }
  }'
```

## Troubleshooting

### 🔴 Kill Switch Attivo
Se il sistema push è disabilitato:
1. Vai su `/push-health`
2. Clicca "✅ Enabled" per riattivare
3. O usa console: `localStorage.removeItem('push:disable'); location.reload()`

### ❌ SW Non Importa sw-push.js
Verifica che `/sw.js` contenga:
```javascript
importScripts('/sw-push.js');
```

### 📱 Subscription Fallita
1. Controlla permission: deve essere "granted"
2. Verifica VAPID key corretta: BMkETBgIgFEj0MOINyixtfrde9ZiMbj-5YEtsX8GpnuXpABax28h6dLjmJ7RK6rlZXUJg1N_z3ba0X6E7Qmjj7A
3. Controlla console per errori di rete
4. Usa /push-health per diagnostica completa

### 🚫 Push Non Arrivano
1. Testa prima subscribe, poi send nella pagina /push-health
2. Verifica che l'endpoint sia del tipo corretto (APNs/FCM)
3. Controlla edge function logs in Supabase
4. iOS: assicurati che l'app sia in modalità PWA (standalone)

### 🔧 "copy is not defined"
Risolto con fallback per clipboard API in PushHealth.tsx

### ❌ "No SW registration"
Il sistema ora tenta automaticamente di registrare il SW se non trovato

## Note di Sicurezza
- La pagina è accessibile in produzione e sviluppo
- Edge functions gestiscono automaticamente cleanup di endpoint scaduti (404/410)
- RLS policies proteggono le subscription per user_id
- VAPID keys sono configurate come secrets in Supabase

## Changes Made (Report Tecnico)

### Frontend Changes:
1. **public/sw.js**: Rimosso try/catch per importScripts, aggiunto banner con timestamp
2. **public/push-health.txt**: Nuovo file statico con "OK"
3. **src/pages/PushHealth.tsx**: 
   - Fix clipboard API con fallback
   - Auto-registrazione SW se non trovato
   - VAPID key corretta
4. **src/main.tsx**: Improved SW registration with better logging

### Backend Changes:
1. **push_subscriptions**: Schema verificato e RLS policies aggiornate
2. **push_subscribe**: Migliorata validazione endpoint e logging
3. **push_send**: Aggiunto endpoint_host nella risposta

### Database:
- push_subscriptions table confermata con endpoint come primary key
- RLS policies permettono inserimenti anonimi
- Trigger per updated_at attivo

© 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ