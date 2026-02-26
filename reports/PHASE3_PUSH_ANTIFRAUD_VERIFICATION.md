# Phase 3 — Verifica PUSH_ADMIN_TOKEN + Antifraud log

**Data:** 2026-02-24  
**Scope:** Config push (stesso token per le due function, nessun log del token), conferma migration antifraud_log, evidenze in report.

---

## 1) PUSH_ADMIN_TOKEN — Verifica e fix config

### Uso del token (stesso valore per entrambe le function)

| Function | Ruolo | Come usa il token |
|----------|--------|--------------------|
| **claim-marker-reward** | Chiamante | Invia `x-admin-token: Deno.env.get('PUSH_ADMIN_TOKEN') \|\| service` (fallback service key se secret non impostato) |
| **webpush-targeted-send** | Ricevente | Confronta `req.headers.get("x-admin-token")` con `Deno.env.get("PUSH_ADMIN_TOKEN")`; se uguali → 200/204 |

Per avere **Push 200/204** è necessario che in Supabase **Edge Function Secrets** sia impostato **PUSH_ADMIN_TOKEN** con un unico valore condiviso (es. un token segreto forte). Stesso secret per tutte le Edge; claim-marker-reward lo invia, webpush-targeted-send lo verifica.

### Nessun log del token

- **claim-marker-reward:** non viene mai loggato il valore di `PUSH_ADMIN_TOKEN` né di `service`; si logga solo `status` (es. `Push sent - status:200 (OK)`).
- **webpush-targeted-send:** si logga solo "[WEBPUSH-TARGETED] ❌ Invalid or missing admin token" in caso 401, mai il valore del token.
- In codice è presente un commento: *"Same secret as webpush-targeted-send; do not log the value"* accanto all’header.

### Fix config (lato Supabase Dashboard)

1. Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets** (o **Settings** → **Secrets**).
2. Aggiungi o modifica **PUSH_ADMIN_TOKEN** con un valore segreto (es. stringa lunga random).
3. Ridistribuisci le function se necessario (i secret sono letti a runtime; di solito non serve ridistribuire).
4. Dopo un claim marker, nei log della function dovrebbe comparire **"Push sent - status:200 (OK)"** o **status:204**.

---

## 2) Phase 3 — Migration antifraud_log applicata e righe presenti

### Migration

- **File:** `supabase/migrations/20260224130000_add_antifraud_log.sql`
- **Contenuto:** tabella `public.antifraud_log` con `event_type`, `user_id`, `marker_id`, `request_id`, `ip_hash`, `ua_hash`, `created_at`; indici e RLS; grant a `service_role`.

### Come confermare che è applicata

Esegui in **Supabase → SQL Editor** (con ruolo che vede `public`):

```sql
-- Verifica che la tabella esista
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'antifraud_log'
) AS table_exists;
```

Se `table_exists = true`, la migration è applicata.

### Query per verificare righe (antifraud OK)

Dopo almeno un claim marker dalla deploy corretta:

```sql
SELECT event_type, user_id, marker_id, request_id, created_at
FROM public.antifraud_log
ORDER BY created_at DESC
LIMIT 10;
```

**Evidenza attesa:** almeno una riga con `event_type = 'marker_claim'`, `request_id` e `marker_id` valorizzati, `created_at` coerente con l’ora del claim.

---

## 3) Evidenze per il report (log push 200/204, query antifraud OK)

### Evidenza 1 — Push 200/204

Dopo aver impostato **PUSH_ADMIN_TOKEN** e aver fatto un claim marker:

- **Dove:** Supabase Dashboard → **Edge Functions** → **claim-marker-reward** → **Logs** (o Logs della function).
- **Cosa cercare:** una riga di log tipo:
  ```text
  M1QR-TRACE: Push sent - status:200 (OK)
  ```
  oppure `status:204 (OK)`.

**Esempio da incollare nel report:**

```text
[Timestamp] M1QR-TRACE: Push sent - status:200 (OK)
```

(Oppure descrizione: "Nei log di claim-marker-reward compare Push sent - status:200 (OK) dopo il claim.")

---

### Evidenza 2 — Antifraud log con righe

Dopo almeno un claim marker, eseguire in SQL Editor:

```sql
SELECT event_type, user_id, marker_id, request_id, created_at
FROM public.antifraud_log
ORDER BY created_at DESC
LIMIT 5;
```

**Esempio di risultato atteso (da incollare o descrivere nel report):**

| event_type   | user_id | marker_id | request_id | created_at          |
|-------------|---------|-----------|------------|---------------------|
| marker_claim | ...     | ...       | ...        | 2026-02-24 12:34:56 |

**Conferma:** "Query antifraud OK: presenti N righe con event_type = 'marker_claim'."

---

## Riepilogo checklist

- [ ] **PUSH_ADMIN_TOKEN** impostato in Supabase Edge Secrets; stesso valore usato da claim-marker-reward e webpush-targeted-send.
- [ ] Nessun log del token (verificato in codice; in log compare solo status).
- [ ] Migration **20260224130000_add_antifraud_log.sql** applicata (tabella `antifraud_log` esiste).
- [ ] Dopo claim: nei log compare **"Push sent - status:200 (OK)"** o **status:204 (OK)**.
- [ ] Query su `antifraud_log` restituisce almeno una riga `marker_claim` con `request_id` e timestamp coerenti.

---

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
