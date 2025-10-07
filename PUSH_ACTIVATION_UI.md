# Push Activation UI - Testing Guide

## 🎯 Feature Overview
Sistema di attivazione push notifications con UI dedicata, completamente feature-flagged e sicuro.

## 🚀 Quick Start (Preview Testing)

### 1. Attiva Feature Flag
Nelle impostazioni della preview (Cloudflare/Lovable) aggiungi:
```env
VITE_PUSH_ACTIVATE_UI=on
```

### 2. Build e Deploy Preview
```bash
pnpm install
pnpm run build
npx wrangler pages deploy dist \
  --project-name m1ssion \
  --branch=feat/push-activate-ui \
  --commit-dirty=true
```

### 3. Test Flow

#### A. Banner Attivazione (Homepage)
1. Login con account **senza** push subscription attiva
2. Vai alla homepage `/`
3. **Aspettati**: Banner blu con CTA "Attiva ora" sotto l'header
4. **Azioni**:
   - Clicca "Dopo" → banner scompare temporaneamente
   - Clicca "Attiva ora" → avvia processo attivazione
5. **Verifica**: Toast di successo + banner scompare definitivamente

#### B. Pagina Dedicata `/notify/activate`
1. Visita direttamente `/notify/activate`
2. **Aspettati**: 10 check diagnostici visualizzati
   - ✅ Browser support
   - ✅ HTTPS attivo
   - ✅ Service Worker registrato
   - ✅ VAPID key caricata
   - ✅ Permessi notifiche
   - ✅ Push subscription presente
   - ✅ JWT valido
   - ✅ Backend raggiungibile
   - ✅ Endpoint salvato DB
   - ✅ Test push funzionante
3. **Azioni**:
   - Clicca "🚀 Attiva Notifiche Push"
   - Accetta permessi browser se richiesto
4. **Verifica**: Tutti i check diventano ✅

#### C. Verifica Database
```bash
# Conta subscriptions attive
curl -sI "$SB_URL/rest/v1/webpush_subscriptions?select=count&is_active=eq.true" \
  -H "apikey: $SERVICE_ROLE" \
  -H "Authorization: Bearer $SERVICE_ROLE" \
  -H "Prefer: count=exact" | grep -i content-range

# Deve mostrare incremento dopo ogni attivazione
```

#### D. Test Broadcast Push
```bash
curl -X POST "$SB_URL/functions/v1/webpush-send" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON" \
  -H "x-admin-token: $ADMIN_PUSH_TOKEN" \
  -d '{
    "audience": "all",
    "payload": {
      "title": "🚀 M1SSION Test",
      "body": "Broadcast verificato",
      "url": "/notifications"
    }
  }' | jq .
```
**Aspettati**: Notifica ricevuta su tutti i dispositivi con subscription attiva

---

## 🔒 Safety Checklist

### ✅ Cosa è stato modificato:
- [x] Route `/notify/activate` aggiunta
- [x] Banner `<ActivateBanner />` in HomeLayout
- [x] Hook `usePushActivation()` per logica centralizzata
- [x] Feature flag `PUSH_ACTIVATE_UI` in config

### ✅ Cosa NON è stato toccato (SAFE):
- [x] `public/sw.js` → Service Worker invariato
- [x] `public/vapid-public.txt` → VAPID key immutata
- [x] Edge functions → Nessun nuovo deploy
- [x] Secrets → Zero hardcoded nel client
- [x] Backend calls → Solo `supabase.functions.invoke()` con JWT auto

---

## 🧪 Test Cases

### TC1: Utente Non Autenticato
- **Given**: Utente anonimo
- **When**: Visita homepage
- **Then**: Banner NON visibile

### TC2: Utente Con Subscription Attiva
- **Given**: Utente loggato + push già attive
- **When**: Visita homepage
- **Then**: Banner NON visibile

### TC3: Utente Senza Subscription
- **Given**: Utente loggato + no push
- **When**: Visita homepage + flag ON
- **Then**: Banner visibile con CTA

### TC4: Attivazione Riuscita
- **Given**: Utente clicca "Attiva ora"
- **When**: Browser supporta push + permessi concessi
- **Then**: 
  - Toast successo
  - Banner scompare
  - Row in `webpush_subscriptions` creata
  - Notifiche broadcast ricevute

### TC5: Attivazione Fallita (Permessi Negati)
- **Given**: Utente clicca "Attiva ora"
- **When**: Utente nega permessi browser
- **Then**: Toast errore con dettagli

### TC6: Feature Flag OFF
- **Given**: `VITE_PUSH_ACTIVATE_UI=off` (o assente)
- **When**: Qualsiasi utente
- **Then**: Banner e route completamente invisibili

---

## 🐛 Troubleshooting

### Banner non compare
1. Verifica flag: `console.log(FEATURE_FLAGS.PUSH_ACTIVATE_UI)`
2. Verifica auth: `console.log(isAuthenticated)`
3. Verifica subscription: `console.log(isSubscribed)`

### Errore "JWT invalid"
- Ricarica pagina → Supabase session refresh
- Logout + login

### Errore "Backend unreachable"
```bash
# Verifica edge function risponda
curl -I "$SB_URL/functions/v1/webpush-upsert" \
  -H "apikey: $ANON"
```

### Push non arrivano
1. Controlla DB: subscription `is_active=true`?
2. Controlla endpoint: `https://fcm.googleapis.com/fcm/send/...` valido?
3. Test con `/push-diagnosi` per dettagli

---

## 📦 Files Structure
```
src/
├── config/
│   └── features.ts              # Feature flags
├── hooks/
│   └── usePushActivation.ts     # Activation logic
├── components/
│   └── notifications/
│       └── ActivateBanner.tsx   # CTA banner
├── pages/
│   └── NotifyActivate.tsx       # Dedicated activation page
├── routes/
│   └── WouterRoutes.tsx         # Route registration
└── utils/
    └── pushRepair.ts            # Core repair logic (unchanged)
```

---

## 🚀 Merge to Production

### Pre-merge checks:
```bash
# 1. TypeScript OK
pnpm run build

# 2. No secrets in code
grep -r "Bearer eyJ" src/  # Must return empty

# 3. Feature flag OFF by default
grep "PUSH_ACTIVATE_UI" src/config/features.ts
# Expected: || false
```

### Merge command:
```bash
git checkout main
git merge --no-ff feat/push-activate-ui \
  -m "feat: push activation UI (feature-flagged, safe deploy)"

pnpm run build
npx wrangler pages deploy dist \
  --project-name m1ssion \
  --branch=main \
  --commit-dirty=true
```

### Post-deploy validation:
```bash
# Verify production still works with flag OFF
curl -sI https://m1ssion.app/ | grep "HTTP/2 200"

# Enable flag gradually
# 1. Test on staging: VITE_PUSH_ACTIVATE_UI=on
# 2. Monitor metrics for 24h
# 3. Enable on production if all green
```

---

## 📊 Success Metrics

Track in analytics:
- **Activation Rate**: `activated_users / total_eligible_users`
- **Completion Time**: Time from banner click to DB row
- **Error Rate**: `failed_activations / total_attempts`
- **Broadcast CTR**: Clicks on push notifications

Query for metrics:
```sql
-- Activation rate (last 7 days)
SELECT 
  COUNT(DISTINCT user_id) as activated,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '7 days') as total
FROM webpush_subscriptions
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## 🔐 Security Notes

1. **No JWT in localStorage**: Subscription uses ephemeral session JWT
2. **No admin tokens**: Client never touches `x-admin-token`
3. **HTTPS enforced**: Push API requires secure context
4. **VAPID rotation**: If needed, only backend update (client auto-fetches)
5. **Rate limiting**: Backend `webpush-upsert` already has abuse protection

---

## 🎯 Next Steps (Post-MVP)

- [ ] A/B test banner copy/design
- [ ] Add "Remind me later" with smart scheduling
- [ ] Analytics dashboard for activation funnel
- [ ] Personalized push content based on user tier
- [ ] Multi-language support for activation flow

---

**Questions?** Check logs in `/push-diagnosi` or contact devops team.
