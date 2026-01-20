# 🔔 PUSH FORCE MODE - PATCH REPORT

**Data:** 2026-01-20  
**File modificato:** `supabase/functions/auto-push-cron/index.ts`  
**Versione:** `2026-01-20-v6-FORCE-MODE`

---

## ✅ MODIFICHE APPLICATE

### 1. Nuovo parametro `force`
- **Body:** `{ "force": true }`
- **Header:** `x-m1-force: 1`
- **Comportamento:** Bypassa SOLO il time slot check
- **Sicurezza:** Accettato SOLO con:
  - `x-cron-secret` valido, oppure
  - `Authorization: Bearer <SERVICE_ROLE_KEY>`

### 2. Run ID tracking
- Ogni esecuzione genera un `run_id` univoco
- Loggato in console e response

### 3. Response aggiornata
```json
{
  "ok": true,
  "run_id": "run_1737366000_abc123",
  "version": "2026-01-20-v6-FORCE-MODE",
  "users_processed": 200,
  "sent": 15,
  "skipped": 185,
  "dry_run": false,
  "force_mode": true,
  "time_slot_bypassed": true
}
```

---

## 🔧 COMANDI DA ESEGUIRE

### 1. Link progetto (solo la prima volta)
```bash
supabase link --project-ref vkjrqirvdvjbemsfzxof
```

### 2. Deploy della funzione modificata
```bash
supabase functions deploy auto-push-cron --project-ref vkjrqirvdvjbemsfzxof
```

### 3. Test FORCE MODE (invio immediato)
```bash
# Con CRON_SECRET (raccomandato)
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron" \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: ${CRON_SECRET}" \
  -d '{"force": true}'
```

```bash
# Con SERVICE_ROLE_KEY
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -d '{"force": true}'
```

```bash
# Con header x-m1-force
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron" \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: ${CRON_SECRET}" \
  -H "x-m1-force: 1" \
  -d '{}'
```

### 4. Test DRY RUN (verifica senza inviare)
```bash
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron" \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: ${CRON_SECRET}" \
  -d '{"force": true, "dry_run": true}'
```

### 5. Test su singolo utente
```bash
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron" \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: ${CRON_SECRET}" \
  -d '{"force": true, "force_user_id": "YOUR_USER_ID"}'
```

### 6. Visualizza logs (dopo link)
```bash
# Link prima (se non fatto)
supabase link --project-ref vkjrqirvdvjbemsfzxof

# Poi logs
supabase functions logs auto-push-cron --since 1h
```

### 7. Push self-test (richiede JWT utente)
```bash
# Questo richiede un JWT utente valido
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/push-self-test" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER_JWT}" \
  -d '{"tag": "manual-test"}'
```

---

## 🔐 SICUREZZA

| Parametro | Richiede Admin? | Cosa bypassa |
|-----------|-----------------|--------------|
| `force: true` | ✅ SÌ | Time slot check |
| `dry_run: true` | ❌ NO | Invio reale (solo log) |
| `force_user_id` | ❌ NO | Targeting utenti |
| `bypass_quiet_hours` | ❌ NO | Quiet hours (legacy) |

**Force mode NON bypassa:**
- Rate limit (1 push per slot per utente)
- Daily limit (4 push/giorno)
- Eligibility (user deve avere subscription attiva)
- Opt-in (user deve avere push registrata)

---

## 📋 QUICK TEST SEQUENCE

```bash
# 1. Deploy
supabase functions deploy auto-push-cron --project-ref vkjrqirvdvjbemsfzxof

# 2. Test dry-run
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -d '{"force": true, "dry_run": true}'

# 3. Se OK, test reale
curl -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -d '{"force": true}'

# 4. Verifica logs
supabase functions logs auto-push-cron --since 5m
```

---

*© 2026 M1SSION™ - Push Force Mode Patch*

