# MARKER CLAIM 500 FIX — .catch is not a function

**Repo:** lux-hunt-treasure  
**Data:** 2026-02-24  
**Scope:** Solo `supabase/functions/claim-marker-reward/index.ts`. Nessuna modifica a src/, Final Shoot, Buzz, IAP, Push, DB, response.

---

## 1) Root cause

**TypeError: admin.from(...).insert(...).catch is not a function**

In ambiente Supabase Edge (Deno), il client `@supabase/supabase-js` restituisce un builder (PostgREST) che in questa runtime **non espone `.catch()`** come metodo. Usare `.catch()` sul valore di ritorno di `.insert()`, `.update()` ecc. causava eccezione → 500 e messaggio in app "Errore nel riscatto del premio".

---

## 2) Forensics (Phase 1) — Punti corretti

| Linea (pre-fix) | Tabella / operazione | Ruolo nel flusso |
|------------------|----------------------|-------------------|
| ~48 | `antifraud_log` INSERT | Non bloccante (Phase 3 antifrode) |
| ~66-68 | `marker_claim_audit` INSERT (already_claimed) | Non bloccante |
| ~108 | `marker_claims` UPDATE (proof_hash) | Non bloccante |
| ~111 | `marker_claim_audit` INSERT (success) | Non bloccante |
| ~397-403 | `user_notifications` INSERT (M1U notif) | Non bloccante |

**Nota:** `req.json().catch(() => ({}))` (linea ~16) è stato lasciato com’è: `req.json()` è una Promise nativa, che supporta `.catch()`.

---

## 3) Patch minima effettuata

**File unico modificato:** `supabase/functions/claim-marker-reward/index.ts`

- **antifraud_log:** sostituito `admin.from("antifraud_log").insert([...]).catch(() => {})` con una **IIFE async void** che fa `await admin.from("antifraud_log").insert(...)`, legge `{ error }` e in caso di errore fa `console.warn`; tutto in `try/catch` per non far mai crashare il claim.
- **marker_claim_audit (already_claimed):** rimosso `.catch()`; eseguito l’insert in `try/catch` con `await`, controllo `{ error }` e `console.warn` in caso di errore.
- **marker_claims UPDATE (proof_hash):** rimosso `.then(() => {}).catch()`; eseguito l’update in `try/catch` con `await` e controllo `{ error }`.
- **marker_claim_audit (success):** come already_claimed, `try/catch` + `await` + `{ error }`.
- **user_notifications (M1U):** rimosso `.catch()`; eseguito l’insert in `try/catch` con `await` e `{ error }`.

Ordine del flusso claim → reward, payload di risposta, rate limit, push e logiche reward **invariati**.

---

## 4) Conferma NO-TOUCH

| Area | Stato |
|------|--------|
| Final Shoot (RPC, signature, return, logica) | **NON TOCCATO** |
| Buzz / Buzz Map | **NON TOCCATO** |
| Pagamenti IAP | **NON TOCCATO** |
| Push native iOS | **NON TOCCATO** |
| UI / design / `src/` | **NESSUN FILE MODIFICATO** |
| Supabase DB / migrations | **NON TOCCATO** |
| Altre Edge Functions | **NON TOCCATE** |
| Response payload claim-marker-reward | **INVARIATO** (stessi campi, stessi codici) |

---

## 5) Prova (dopo deploy)

1. **Deploy:**  
   `npx supabase functions deploy claim-marker-reward`

2. **Test:** una invocazione di claim marker (es. da app iOS su marker con reward M1U).

3. **Esito atteso:**  
   - HTTP 200 (con `ok: true` e `summary` in caso di successo, oppure `ok: false` con codice gestito tipo `ALREADY_CLAIMED` / `NO_REWARD`).  
   - Nessun 500.  
   - Nei log Supabase nessun `TypeError: ... .catch is not a function`.  
   - Se il reward è M1U, saldo accreditato e (se insert notifica OK) notifica in-app visibile.

4. **Verifica log (esempio):**  
   Timestamp della richiesta di test: _[inserire dopo il test]_  
   Esito: _[es. 200 OK, reward M1U accreditato]_

---

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
