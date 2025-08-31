# 🔧 M1SSION™ Push Health Diagnostic

## Accesso alla Pagina
- **URL Produzione**: https://m1ssion.eu/push-health
- **URL Sviluppo**: http://localhost:5173/push-health

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

## Comandi CLI di Verifica

```bash
# 1. Verifica che SW importi sw-push.js
curl -sS https://m1ssion.eu/sw.js | grep -q "importScripts('/sw-push.js')" && echo "✅ SW Import OK" || echo "❌ SW Import MISSING"

# 2. Verifica che sw-push.js esista
curl -sS https://m1ssion.eu/sw-push.js >/dev/null && echo "✅ sw-push.js OK" || echo "❌ sw-push.js MISSING"

# 3. Verifica pagina push-health
curl -sS https://m1ssion.eu/push-health | grep -q "Push Health" && echo "✅ Page OK" || echo "❌ Page MISSING"
```

## Edge Functions Testing

### push_subscribe
```bash
curl -X POST https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/push_subscribe \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
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
  -H "apikey: YOUR_ANON_KEY" \
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
2. Verifica VAPID key in PushHealth.tsx
3. Controlla console per errori di rete

### 🚫 Push Non Arrivano
1. Testa prima subscribe, poi send
2. Verifica che l'endpoint sia del tipo corretto (APNs/FCM)
3. Controlla edge function logs in Supabase
4. iOS: assicurati che l'app sia in modalità PWA (standalone)

## Note di Sicurezza
- La pagina è accessibile solo in produzione
- Edge functions gestiscono automaticamente cleanup di endpoint scaduti (404/410)
- RLS policies proteggono le subscription per user_id

© 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ