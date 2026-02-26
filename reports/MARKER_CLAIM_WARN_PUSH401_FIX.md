# MARKER CLAIM — Warning schema cache + Push 401 — Fix report

**Repo:** lux-hunt-treasure  
**Data:** 2026-02-24  
**Scope:** Solo `supabase/functions/claim-marker-reward/index.ts`. Nessuna modifica a src/, Final Shoot, Buzz, IAP, Push native iOS, schema/migrations non correlate.

---

## 1) Root cause WARNING "notification_type"

**Causa: (A) La colonna non esiste — il codice usava il nome sbagliato.**

- **Schema reale** (da migrations):
  - Tabella `public.user_notifications` creata in `20251120073459_*` con: `id`, `user_id`, `message`, `is_read`, `created_at`, `read_at`.
  - Migration `20251120075734_*` aggiunge: **`type`** (text, default 'info'), `title`, `is_deleted`.
  - Migration `20250804071343_*` / `20250804065628_*` aggiunge: **`metadata`** (jsonb).
- **Conclusione:** la colonna per il “tipo” di notifica è **`type`**, non `notification_type`. Il COMMENT in migration dice: *"Notification type: info, warning, error, success, clue, reward, mission, etc."*.
- PostgREST segnalava "Could not find the 'notification_type' column" perché la colonna non esiste; non era un problema di schema cache (B), né di nome tabella (C).

---

## 2) Fix applicato (notification_type)

**File:** `supabase/functions/claim-marker-reward/index.ts`

- **Modifica:** in tutti gli insert su `user_notifications` il campo **`notification_type`** è stato sostituito con **`type`** (stesso valore: `'reward'`, `'clue'`, `'prize'`).
- **Tabelle/colonne coinvolte:** solo `public.user_notifications`; payload insert ora usa: `user_id`, **`type`**, `title`, `message`, `metadata`.
- **Diff minima:** sostituzione globale `notification_type:` → `type:` negli oggetti passati a `.insert([{ ... }])` per `user_notifications` (tutti i casi: buzz_free, message, xp_points, event_ticket, badge, m1u, clue, physical_prize).
- Nessuna modifica alla logica delle notifiche (stesso evento, stesso contenuto).

---

## 3) Root cause PUSH 401

- **Chiamata:** la Edge `claim-marker-reward` invoca `POST ${SUPABASE_URL}/functions/v1/webpush-targeted-send` con header **`x-admin-token`** = `Deno.env.get('PUSH_ADMIN_TOKEN') || service` (service = SERVICE_ROLE_KEY).
- **Lato `webpush-targeted-send`:** auth con `req.headers.get("x-admin-token")` e confronto con `Deno.env.get("PUSH_ADMIN_TOKEN")`. Se `!adminHdr || !ADMIN || adminHdr !== ADMIN` → **401** con `reason: "invalid_admin_token"`.
- **Causa probabile 401:**
  - **PUSH_ADMIN_TOKEN** non impostato in Supabase (Edge Function secrets) → `webpush-targeted-send` vede `ADMIN === ""` → 401.
  - Oppure valore diverso tra le due function (claim-marker-reward invia un token, webpush-targeted-send si aspetta un altro).

---

## 4) Fix / azione per PUSH 401

- **Codice:** aggiunto log esplicito quando la risposta push è 401:  
  `"Push 401 - set Edge secret PUSH_ADMIN_TOKEN (same value for claim-marker-reward and webpush-targeted-send)"`.  
  Il claim resta **non bloccante** (best-effort); in caso di 401 il claim completa comunque.
- **Config (obbligatorio per eliminare il 401):**
  1. Supabase Dashboard → **Project Settings** → **Edge Functions** (o **Secrets**).
  2. Impostare il secret **PUSH_ADMIN_TOKEN** (es. un token condiviso o la SERVICE_ROLE_KEY, senza esporlo in log).
  3. Stesso valore deve essere usato da entrambe le function: claim-marker-reward lo invia in `x-admin-token`, webpush-targeted-send lo confronta con `PUSH_ADMIN_TOKEN`.  
  Se non è impostato, claim-marker-reward invia la service key come fallback; webpush-targeted-send però confronta solo con `PUSH_ADMIN_TOKEN`, quindi se questo non è impostato si ha 401.

---

## 5) File toccati

| File | Modifica |
|------|----------|
| `supabase/functions/claim-marker-reward/index.ts` | (1) `notification_type` → `type` in tutti gli insert su `user_notifications`; (2) log chiaro in caso di push 401. |

Nessun altro file modificato. Nessuna migration SQL aggiunta o modificata.

---

## 6) Checklist vincoli

| Area | Stato |
|------|--------|
| src/ (UI, design, frontend) | **NON TOCCATO** |
| Final Shoot (RPC, UI, logica, pricing) | **NON TOCCATO** |
| Buzz / Buzz Map | **NON TOCCATO** |
| Pagamenti IAP | **NON TOCCATO** |
| Push native iOS (Capacitor/Apple Push) | **NON TOCCATO** |
| Supabase schema/migrations (non correlate) | **NON TOCCATI** |
| Altre Edge Functions (solo claim-marker-reward modificata) | **Rispettato** |

---

## 7) Verifica (Phase 3)

Dopo deploy di `claim-marker-reward`:

1. Eseguire un claim marker (nuovo e già claimato).
2. Verificare:
   - **Nessun** warning su `notification_type` nei log Edge.
   - Nessun crash/500; claim completa e M1U si accredita.
   - **Push 401:** se il secret `PUSH_ADMIN_TOKEN` è impostato correttamente (stesso valore per entrambe le function), il 401 sparisce; altrimenti il 401 resta ma il log indica chiaramente di impostare il secret e il claim non viene bloccato.

---

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
