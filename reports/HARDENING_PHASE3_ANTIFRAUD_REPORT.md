# HARDENING PHASE 3 — Antifraud Log (Marker-only)

**Repo:** lux-hunt-treasure  
**Data:** 2026-02-24  
**Scope:** Antifrode solo Marker Rewards (Final Shoot non toccato). request_id + ip_hash + ua_hash, minimizzazione GDPR.

---

## 1) Cosa è stato aggiunto

- **Tabella `public.antifraud_log`** (solo evento `marker_claim`):
  - `id`, `event_type`, `user_id`, `marker_id`, `request_id`, `ip_hash`, `ua_hash`, `created_at`
  - Solo hash (SHA-256 hex); nessun IP/UA in chiaro.
- **Edge Function `claim-marker-reward`**: all’inizio handler (dopo rate limit), per ogni richiesta:
  - generazione `request_id` (UUID v4);
  - lettura IP dal primo elemento di `x-forwarded-for` (normalizzato trim);
  - lettura `User-Agent`;
  - calcolo `ip_hash` e `ua_hash` (SHA-256 hex);
  - insert in `antifraud_log` **non bloccante** (failure non blocca il claim, nessun log in chiaro di IP/UA).

---

## 2) File toccati

| File | Modifica |
|------|----------|
| `supabase/migrations/20260224130000_add_antifraud_log.sql` | **Nuovo** — tabella, indici, RLS, grant |
| `supabase/functions/claim-marker-reward/index.ts` | Aggiunta generazione request_id, lettura IP/UA, hash, insert antifraud (nessuna modifica al flusso claim/reward né alla response) |

**Nessun file in `src/` modificato.**  
**Nessuna modifica a:** `execute_final_shoot`, Buzz/Buzz Map, IAP, Push native, UI, Supabase Edge push (webpush-targeted-send).

---

## 3) SQL migration

- **Nome:** `20260224130000_add_antifraud_log.sql`
- **Contenuto:** CREATE TABLE `antifraud_log`, CHECK `event_type IN ('marker_claim')`, indici su (user_id, created_at), (event_type, created_at), (marker_id, created_at), (request_id); RLS abilitato; policy INSERT WITH CHECK (true); policy SELECT USING (false); GRANT INSERT/SELECT a service_role.

---

## 4) Come verificare

Dopo deploy della migration e della function:

1. Eseguire un claim marker (anche su marker già claimato va bene).
2. In Supabase (SQL Editor o dashboard con service_role) eseguire:

```sql
SELECT event_type, user_id, marker_id, request_id, created_at
FROM public.antifraud_log
ORDER BY created_at DESC
LIMIT 5;
```

- Verificare che compaia una riga con `event_type = 'marker_claim'`, `request_id` valorizzato, `user_id` e `marker_id` coerenti.
- Con headers presenti (proxy che invia x-forwarded-for e user-agent), `ip_hash` e `ua_hash` saranno valorizzati (stringhe hex 64 caratteri).

---

## 5) Checklist vincoli (conferma NO-TOUCH)

| Area | Stato |
|------|--------|
| Final Shoot (RPC execute_final_shoot, signature, return, logica, pricing) | **NON TOCCATO** |
| Buzz / Buzz Map | **NON TOCCATO** |
| Pagamenti IAP | **NON TOCCATO** |
| Push native iOS | **NON TOCCATO** |
| UI / design / `src/` | **NESSUN FILE MODIFICATO** |
| Edge webpush-targeted-send | **NON TOCCATO** |
| Response payload claim-marker-reward | **NON MODIFICATO** (stessi campi, stesso ordine) |
| Rate limit claim-marker-reward | **INTATTO** |
| Phase 2 (proof_hash, marker_claim_audit) | **INTATTI** |

---

## 6) Limitazione documentata (Phase 3)

- **Final Shoot:** in Phase 3 non è stato aggiunto log antifrode per Final Shoot. L’RPC `execute_final_shoot` non riceve IP/UA (chiamata da client Supabase); per loggare anche il Final Shoot servirebbero modifiche a `src/` (passaggio parametri) o alla firma RPC, quindi **non fatto** in Phase 3 come da stop condition.

---

## 7) Phase 0 — Rollback safety

- **Tag locale creato:** `safety/hardening-phase3-preapply-20260224-1200`
- **Push remoto:** non eseguito (errore auth Git); eseguire manualmente se necessario:  
  `git push origin safety/hardening-phase3-preapply-20260224-1200`

---

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
