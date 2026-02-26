# Hardening Phase 2/5 — Implementation Report (Audit Trail + Proof Hash)

**Repo:** `/Users/josephmule/lux-hunt-treasure`  
**Baseline tag:** `safety/hardening-baseline-20260224-1158`  
**Pre-apply tag:** `safety/hardening-phase2-preapply-20260224-1205`  
**Date:** 2026-02-24

---

## 1. Migrazioni create

| File | Contenuto |
|------|-----------|
| `supabase/migrations/20260224120000_add_final_shoot_audit.sql` | Tabella `final_shoot_audit` (id, event_type, mission_id, user_id, attempt_id, outcome, request_id, created_at); RLS INSERT solo per postgres/supabase_admin; SELECT solo service_role. Colonna `final_shoot_winners.proof_hash` (ADD COLUMN IF NOT EXISTS). |
| `supabase/migrations/20260224120001_add_marker_claim_audit.sql` | Colonna `marker_claims.proof_hash` (ADD COLUMN IF NOT EXISTS). Tabella `marker_claim_audit` (id, marker_id, user_id, claim_id, outcome, created_at); RLS INSERT/SELECT service_role. |
| `supabase/migrations/20260224120002_final_shoot_audit_proof_in_rpc.sql` | CREATE OR REPLACE `execute_final_shoot`: dopo INSERT winner e quando `existing_winner = p_user_id` calcola proof_hash (SHA256 mission_id\|\|winner_user_id\|\|attempt_id\|\|won_at\|\|distance_meters) e UPDATE `final_shoot_winners.proof_hash`; INSERT in `final_shoot_audit` per outcome winner/race_lost/race_error/missed. Stessa signature, stesso return shape, stessa logica di vincita. |

---

## 2. Funzioni / Edge modificate

| Oggetto | Modifica |
|--------|----------|
| **public.execute_final_shoot** | Aggiunte variabile `v_outcome`; dopo INSERT winner e SELECT existing_winner: se winner allora UPDATE proof_hash su final_shoot_winners, INSERT final_shoot_audit (outcome 'winner'); se race_lost/race_error/missed solo INSERT final_shoot_audit. Nessun cambio parametri, nessun cambio ritorno RPC, nessun cambio criteri di vincita. |
| **supabase/functions/claim-marker-reward/index.ts** | Se already claimed: INSERT in `marker_claim_audit` (outcome 'already_claimed') in modo non bloccante (.catch). Dopo insert marker_claims: .select('id, claimed_at').single(); calcolo proof_hash SHA256(marker_id\|\|user_id\|\|claimed_at) in hex; UPDATE marker_claims SET proof_hash; INSERT marker_claim_audit (outcome 'success') non bloccante. Nessun cambio logica reward, rate limit, response shape. |

---

## 3. Verifica: flussi core NON cambiati

| Flusso | Verifica |
|--------|----------|
| Final Shoot vincita | Invariato: stessa formula Haversine, tolleranza 19 m, INSERT attempt → INSERT winner ON CONFLICT DO NOTHING → RETURN. Aggiunti solo UPDATE proof_hash e INSERT audit dopo decisione. |
| Final Shoot return | Invariato: tutti i jsonb_build_object identici (stessi campi e messaggi). |
| Marker claim | Invariato: stesso ordine (check → insert claim → push → loop rewards). Aggiunti solo select id/claimed_at, calcolo proof_hash, update proof_hash, insert audit; nessun cambio a reward processing. |
| Marker response | Invariato: ritorno { ok: true, nextRoute, summary } o { ok: false, code } senza nuovi campi. |

---

## 4. Query di test (da eseguire dopo migrazioni e primo tentativo/claim)

```sql
-- Dopo almeno un tentativo Final Shoot vincente:
SELECT proof_hash FROM public.final_shoot_winners ORDER BY won_at DESC LIMIT 1;

-- Dopo almeno un claim marker:
SELECT proof_hash FROM public.marker_claims ORDER BY claimed_at DESC LIMIT 1;

-- Audit Final Shoot (solo con service_role):
SELECT id, event_type, mission_id, user_id, outcome, created_at FROM public.final_shoot_audit ORDER BY created_at DESC LIMIT 5;

-- Audit Marker (solo con service_role):
SELECT id, marker_id, user_id, claim_id, outcome, created_at FROM public.marker_claim_audit ORDER BY created_at DESC LIMIT 5;
```

---

## 5. Build e lint

- **Lint:** Nessun errore su `supabase/functions/claim-marker-reward/index.ts`.
- **Build frontend:** `npm run build` ha restituito errore **preesistente** (Cannot find package 'vite' in node_modules), **non** causato dalle modifiche Phase 2. Nessun file in `src/` è stato modificato (no-touch list rispettata).

---

## 6. Riepilogo file toccati

| File | Tipo modifica |
|------|----------------|
| `supabase/migrations/20260224120000_add_final_shoot_audit.sql` | Nuovo |
| `supabase/migrations/20260224120001_add_marker_claim_audit.sql` | Nuovo |
| `supabase/migrations/20260224120002_final_shoot_audit_proof_in_rpc.sql` | Nuovo (sostituisce corpo execute_final_shoot) |
| `supabase/functions/claim-marker-reward/index.ts` | Aggiunte: audit already_claimed; insert+select claim; proof_hash calcolo+update; audit success. |

**No-touch list rispettata:** nessuna modifica a `src/components/final-shoot/*`, `useFinalShoot.ts`, `src/components/marker-rewards/*`, `src/pages/sandbox/*`, admin_credit_m1u, increment_xp, push, iOS, IAP, Buzz.

---

## 7. Rollback (se necessario)

```bash
git checkout safety/hardening-phase2-preapply-20260224-1205 -- supabase/migrations/ supabase/functions/claim-marker-reward/
# Poi rimuovere le 3 migrazioni 20260224120000, 20260224120001, 20260224120002 e ripristinare execute_final_shoot dalla migrazione 20260126_004.
```

---

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
