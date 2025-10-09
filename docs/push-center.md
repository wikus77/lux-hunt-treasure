# 📡 Push Center - Documentazione

## Overview
Push Center è il pannello unificato per la gestione completa delle notifiche push in M1SSION™. Sostituisce tutti i vecchi pannelli separati (Admin Push Console, Push Console, M1SSION Debug Suite, Firebase FCM Test Suite) con un'interfaccia unica e coerente.

## Accesso
- **Route**: `/panel-access` → sezione "📡 Push Center" (solo admin)
- **Prerequisiti**:
  - Utente admin autenticato
  - Accesso al M1SSION Panel

## Funzionalità

### 1. Send Tab - Invio Notifiche
**Obiettivo**: Inviare notifiche push in modo flessibile

**Audience**:
- **All**: Invio broadcast a tutti gli utenti attivi (richiede `x-admin-token`)
- **User ID**: Invio a un utente specifico (richiede JWT utente autenticato)
- **Endpoint**: Invio a un endpoint specifico (avanzato)

**Payload**:
Editor JSON per configurare:
```json
{
  "title": "🔔 Titolo",
  "body": "Messaggio della notifica",
  "url": "/percorso-app"
}
```

**Risultati**:
- HTTP status code
- Response body (pretty-printed)
- Tempo di risposta (ms)
- Suggerimenti per risolvere errori

### 2. Debug Tab - Diagnostica E2E
**Obiettivo**: Diagnosticare problemi di subscription e configurazione

**Informazioni visualizzate**:
- ✅ Notification permission (granted/denied/default)
- ✅ Service Worker status (registrato, controlling, scope)
- ✅ Subscription status (attiva/assente, endpoint tail)
- ✅ Session info (email utente, user ID short)
- ✅ VAPID public key (tail)

**Azioni**:
- **(Re)Subscribe**: Esegue subscription Web Push completa e salva su DB via `webpush-upsert`
- **Test Self**: Invia notifica test all'utente corrente
- **Test All (Admin)**: Invia broadcast test (richiede admin token)

**Output**:
- Ultima risposta upsert (status, body, suggerimenti)
- Ultima risposta send (status, body, tempo, suggerimenti)

### 3. Subscriptions Tab - Tabella Subscriptions
**Obiettivo**: Visualizzare le ultime 50 subscriptions salvate nel DB

**Colonne**:
- Created (data creazione)
- User ID (short, 8 caratteri)
- Endpoint (tail, ultimi 30 caratteri)
- Active (badge verde/grigio)
- Last Used (timestamp ultimo utilizzo)

**Funzionalità**:
- Refresh manuale
- Auto-scroll su overflow
- Gestione errori RLS

### 4. Logs Tab - Edge Function Logs
**Obiettivo**: Accesso rapido ai logs delle Edge Functions

**Link diretti**:
- `webpush-upsert` logs (Supabase Dashboard)
- `webpush-send` logs (Supabase Dashboard)

**Pattern di ricerca suggeriti**:
- `error` - Errori generici
- `[WEBPUSH-UPSERT]` - Log upsert
- `[WEBPUSH-SEND]` - Log send
- `401` / `500` - Errori HTTP
- `✅` / `❌` - Operazioni riuscite/fallite

**Debug Tips**:
- No logs? Verifica deploy e invocazioni
- CORS errors? Controlla header nelle funzioni
- 401 Unauthorized? JWT scaduto o mancante
- 500 errors? Secrets VAPID/PUSH_ADMIN_TOKEN non configurati

## Prerequisiti Tecnici

### 1. Environment Variables (Supabase Secrets)
```bash
PUSH_ADMIN_TOKEN=<token_generato>
VAPID_PUBLIC_KEY=<chiave_pubblica>
VAPID_PRIVATE_KEY=<chiave_privata>
VAPID_CONTACT=mailto:wikus77@hotmail.it
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

### 2. Database
Tabella `public.webpush_subscriptions`:
```sql
CREATE TABLE public.webpush_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  endpoint text UNIQUE NOT NULL,
  keys jsonb NOT NULL,
  device_info jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz
);
```

### 3. Edge Functions
- `webpush-upsert`: Gestisce upsert subscriptions (richiede JWT)
- `webpush-send`: Gestisce invio notifiche (supporta admin bypass con `x-admin-token` o JWT user)

### 4. Frontend
- Service Worker registrato (`/sw.js`)
- VAPID public key configurato in `.env` (`VITE_VAPID_PUBLIC_KEY`)

## Messaggi di Errore e Soluzioni

### ⚠️ "JWT mancante o non valido"
**Causa**: Utente non autenticato o token scaduto  
**Soluzione**: Esegui logout/login

### ⚠️ "Endpoint mancante o non valido"
**Causa**: Subscription non creata correttamente  
**Soluzione**: Premi "(Re)Subscribe" nel Debug Tab

### ⚠️ "Chiavi push mancanti (p256dh/auth)"
**Causa**: PushManager.subscribe() non ha restituito le chiavi  
**Soluzione**: Verifica browser support e permessi

### ⚠️ "Configura PUSH_ADMIN_TOKEN"
**Causa**: Secret non configurato in Supabase  
**Soluzione**: 
```bash
supabase secrets set PUSH_ADMIN_TOKEN="your_token_here"
```

### ⚠️ "VAPID keys non configurate"
**Causa**: Secrets VAPID mancanti  
**Soluzione**: Verifica `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_CONTACT` in Supabase

### ⚠️ "Nessuna subscription attiva trovata"
**Causa**: Nessun utente ha fatto subscribe  
**Soluzione**: Almeno 1 utente deve eseguire "(Re)Subscribe"

## Test di Accettazione

Usa questa checklist per verificare il corretto funzionamento:

- [ ] **DebugTab mostra**:
  - [ ] Permission status (granted/denied/default)
  - [ ] SW status (registered/controlling/scope)
  - [ ] Session info (email/user_id)
  - [ ] VAPID key tail
  - [ ] Subscription status (yes/no)

- [ ] **(Re)Subscribe** → ritorna 200 da `webpush-upsert`
- [ ] **SubscriptionsTab** → mostra ≥1 riga quando presente
- [ ] **SendTab "All – Admin"** → 200 {success:true,...} anche senza Authorization
- [ ] **SendTab "Self"** → 200 con Authorization utente valido
- [ ] **Menu**: esiste SOLO "📡 Push Center" per messaging; vecchi pannelli spariti

## Migrazione dai Vecchi Pannelli

### Pannelli Archiviati
I seguenti pannelli sono stati rimossi/archiviati in `src/_archive/`:
- `AdminPushConsolePage.tsx`
- `UserPushConsolePage.tsx`
- `M1ssionDebugTest.tsx` (debug suite)
- `M1ssionFirebasePushTestPanel.tsx` (Firebase FCM suite)

### Equivalenze Funzionali
| Vecchio Pannello | Nuova Funzionalità |
|-----------------|-------------------|
| Admin Push Console | Send Tab (audience: "All") |
| Push Console | Send Tab (audience: "User ID") |
| M1SSION Debug Suite | Debug Tab |
| Firebase FCM Test Suite | (deprecato, usa Web Push) |

## Link Utili
- [webpush-upsert logs](https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/functions/webpush-upsert/logs)
- [webpush-send logs](https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/functions/webpush-send/logs)
- [Supabase Secrets](https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/settings/vault/secrets)

## Contribuire
Per segnalare bug o richiedere feature:
1. Verifica i logs delle Edge Functions
2. Controlla la console browser (F12)
3. Apri issue con screenshot e passi per riprodurre

---

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
