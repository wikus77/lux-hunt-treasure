# Hardening Baseline — Phase 1/5 (Analysis & Preparation)

**Repo:** `/Users/josephmule/lux-hunt-treasure`  
**Tag baseline:** `safety/hardening-baseline-20260224-1158`  
**HEAD at baseline:** `a0c7ed3b9`  
**Date:** 2026-02-24  
**Scope:** Final Shoot + Marker Rewards — analysis only, no functional changes.

---

## 1. Mappa punti di integrazione

### 1.1 Final Shoot

| Punto | Tipo | Dettaglio |
|------|------|-----------|
| **Entry** | RPC | `public.execute_final_shoot(p_user_id UUID, p_mission_id UUID, p_lat DOUBLE PRECISION, p_lng DOUBLE PRECISION)` — SECURITY DEFINER, `search_path = public`. |
| **Tabelle read** | DB | `current_mission_data` (prize_lat, prize_lng, is_active), `missions` (end_date per is_final_shoot_available), `profiles` (m1_units), `user_wallet`, `final_shoot_winners`, `final_shoot_attempts` (per get_final_shoot_pricing / remaining). |
| **Tabelle write** | DB | `final_shoot_attempts` (INSERT tentativo), `final_shoot_winners` (INSERT ON CONFLICT DO NOTHING), `profiles` (M1U deduct/refund), `user_wallet` (idem). |
| **Frontend call sites** | Client | `src/components/final-shoot/FinalShootContext.tsx` — `supabase.rpc('execute_final_shoot', { p_user_id, p_mission_id, p_lat, p_lng })`; `src/hooks/useFinalShoot.ts` — stesso RPC. Click da `FinalShootOverlay.tsx` → `executeShoot(lat, lng)`. |
| **Helper RPC** | DB | `is_final_shoot_available(p_mission_id)`, `get_final_shoot_remaining(p_user_id, p_mission_id)`, `get_final_shoot_pricing(p_user_id, p_mission_id)`. |

**File coinvolti (Final Shoot):**
- `supabase/migrations/20260126_004_final_shoot_balance_response.sql` — RPC attuale
- `supabase/migrations/20260117_001_final_shoot_atomic_winner.sql` — final_shoot_winners, lock
- `supabase/migrations/20260117_003_aaa_hardening.sql` — trigger immutable final_shoot_winners
- `supabase/migrations/20251203_mission_command_center.sql` — is_final_shoot_available, get_final_shoot_remaining, schema attempts, current_mission_data
- `src/components/final-shoot/FinalShootContext.tsx`
- `src/components/final-shoot/FinalShootOverlay.tsx`
- `src/hooks/useFinalShoot.ts`

---

### 1.2 Marker Rewards

| Punto | Tipo | Dettaglio |
|------|------|-----------|
| **Entry** | Edge Function | `supabase/functions/claim-marker-reward/index.ts` — invoke da client con `{ body: { markerId } }`, JWT in Authorization. |
| **Tabelle read** | DB | `marker_rewards` (reward_type, payload, description per marker_id), `marker_claims` (check already claimed — admin client). |
| **Tabelle write** | DB | `marker_claims` (INSERT), `buzz_grants`, `user_xp` / RPC `increment_xp`, `event_tickets`, `user_badges`, `user_clues`, `prize_claims`, `user_notifications`, `admin_logs` (physical_prize). `profiles`/`user_wallet` via RPC `admin_credit_m1u`. |
| **Frontend call sites** | Client | `src/components/marker-rewards/ClaimRewardModal.tsx` — `supabase.functions.invoke('claim-marker-reward', { body: { markerId } })`; `src/pages/sandbox/map3d/layers/RewardsLayer3D.tsx` (usa modal/hook che invoca claim). |
| **Side-effects** | Logic | Per ogni reward_type: buzz_free → buzz_grants upsert + user_notifications; message → user_notifications; xp_points → user_xp upsert + increment_xp RPC + user_notifications; event_ticket → event_tickets insert + user_notifications; badge → user_badges + user_notifications; m1u → admin_credit_m1u RPC + user_notifications; clue → user_clues + user_notifications; physical_prize → prize_claims + user_notifications + admin_logs. Push via webpush-targeted-send. |

**File coinvolti (Marker):**
- `supabase/functions/claim-marker-reward/index.ts`
- `supabase/functions/_shared/rateLimit.ts` — applyRateLimit per claim-marker-reward
- `supabase/migrations/20250814124057_ec3adf48-a39b-45ce-98f2-8df374b9c48f.sql` — marker_rewards, marker_claims (UNIQUE)
- `supabase/migrations/20250114_003_fix_marker_claims_visibility.sql` — RLS marker_claims
- `src/components/marker-rewards/ClaimRewardModal.tsx`
- `src/pages/sandbox/map3d/layers/RewardsLayer3D.tsx`
- `src/hooks/useMarkerRewards.ts` (se presente; altrimenti logica in layer/map)

---

## 2. Cosa aggiungere per ciascun punto

### 2.1 Audit trail DB (schema)

| Sistema | Dove | Cosa aggiungere |
|---------|------|-----------------|
| **Final Shoot** | Nuova tabella o colonne | Tabella dedicata `final_shoot_audit` (opzionale) oppure colonna `audit_meta JSONB` su `final_shoot_attempts` / `final_shoot_winners` per request_id, esito, step. Schema suggerito: `id`, `event_type` (attempt \| winner), `mission_id`, `user_id`, `attempt_id` (nullable), `outcome`, `request_id`, `created_at`. |
| **Marker** | Nuova tabella o colonne | Tabella `marker_claim_audit` (id, marker_id, user_id, claim_id, outcome, request_id, created_at) oppure colonna su `marker_claims`: `audit_meta JSONB` (request_id, reward_summary). |

**Rischi annotati:** Nessun RLS change sui dati esistenti; nuove tabelle devono avere RLS e policy “solo insert da service_role / RPC” e SELECT limitato (es. admin o stesso user per propri record). SECURITY DEFINER già usato per execute_final_shoot; l’audit può essere scritto dalla stessa RPC.

---

### 2.2 Proof hash (algoritmo + dati)

| Sistema | Dove | Cosa aggiungere |
|---------|------|-----------------|
| **Final Shoot** | `final_shoot_winners` | Colonna `proof_hash TEXT` (es. SHA-256 in hex). Payload da hashing: `mission_id || winner_user_id || attempt_id || won_at (ISO) || distance_meters`. Algoritmo: SHA-256; encoding: hex. Calcolo dentro RPC subito dopo INSERT winner. |
| **Marker** | `marker_claims` o tabella audit | Colonna `proof_hash TEXT` su `marker_claims`. Payload: `marker_id || user_id || claim_id (o id) || claimed_at (ISO)`. Algoritmo: SHA-256; encoding: hex. Calcolo in Edge dopo INSERT claim (o in RPC se si sposta l’insert in DB). |

**Rischi annotati:** Nessun PII nel payload dell’hash; solo ID e timestamp. Algoritmo deterministico per verificabilità.

---

### 2.3 Antifrode log (IP, UA, request_id) con minimizzazione GDPR

| Sistema | Dove | Cosa aggiungere |
|---------|------|-----------------|
| **Final Shoot** | RPC non ha accesso a IP/UA | Opzione A: passare da client `request_id` (UUID) e opzionalmente `ip_hash` (hash dell’IP, non IP in chiaro), `ua_hash` (hash di User-Agent) per minimizzazione. Salvare in audit/attempt: request_id, ip_hash, ua_hash (tutti nullable). Opzione B: log antifrode in Edge/API gateway se la chiamata passa da una Edge che fa proxy all’RPC. |
| **Marker** | Edge Function | Request ha accesso a `req.headers.get('x-forwarded-for')`, `User-Agent`. Creare tabella `antifraud_log` (id, event_type, user_id, request_id, ip_hash, ua_hash, marker_id/attempt_id, created_at). Salvare solo hash (es. SHA-256) di IP e UA, retention policy (es. 90 giorni). request_id: UUID generato all’ingresso Edge. |

**Rischi annotati:** RLS: antifraud_log accessibile solo a service_role o ruolo admin; non esporre a frontend. GDPR: hash invece di IP/UA in chiaro riduce identificabilità; retention e base giuridica (legitimate interest) da definire in policy.

---

### 2.4 Email ufficiali (trigger + template + log)

| Sistema | Dove | Cosa aggiungere |
|---------|------|-----------------|
| **Final Shoot** | Post-vincita | Trigger AFTER INSERT su `final_shoot_winners` che invoca una Edge Function (pg_net o Supabase hook) con winner_user_id, mission_id, won_at — **oppure** (più semplice) dalla RPC dopo INSERT winner: chiamata a Edge `send-final-shoot-winner-email` con stesso payload. Template: subject/body “Hai vinto il Final Shoot – Missione X – Data”. Log: tabella `email_sends` (id, recipient_user_id, template_id, sent_at, status, request_id) o uso log esistente send-welcome-email. |
| **Marker** | Post-claim (opzionale per physical) | Per `physical_prize` (e opzionale altri): dopo insert in prize_claims, chiamare Edge `send-marker-prize-email` con user_id, prize_name, claim_code. Template e log come sopra. |

**Rischi annotati:** Email provider: già in uso SMTP (send-welcome-email, send-contact-email); verificare che invio da Edge non esponga segreti. PII: email address from auth.users o profiles; trattare come dati personali (GDPR). Trigger su tabella: preferibile “invoke Edge da RPC” per evitare trigger complessi e timeout.

---

### 2.5 Transazioni atomiche complete (dove e come)

| Sistema | Dove | Cosa aggiungere |
|---------|------|-----------------|
| **Final Shoot** | Già in una sola RPC | Nessuna modifica strutturale necessaria; la funzione è già transazionale. Eventuali insert in audit/proof_hash vanno fatti nella stessa RPC prima del COMMIT implicito. |
| **Marker** | Edge Function | Oggi: check claim → insert marker_claims → loop reward (multi-step, no DB transaction). Miglioramento: spostare “claim + erogazione reward” in una **singola RPC** (es. `claim_marker_reward_rpc(p_user_id, p_marker_id, p_request_id, p_ip_hash, p_ua_hash)`) che in una transazione: check existing claim, insert marker_claims, applica tutti i reward (buzz_grants, M1U, user_notifications, ecc.), insert audit, calcola proof_hash. Edge Function diventa un thin wrapper che legge JWT, genera request_id, hasha IP/UA, chiama RPC. |

**Rischi annotati:** SECURITY DEFINER sulla nuova RPC; search_path = public; validazione p_user_id = auth.uid() all’ingresso (o passare solo JWT e prendere user_id da auth.uid() nella RPC). RLS: la RPC bypassa RLS; quindi tutti gli insert devono usare permessi del definer in modo sicuro.

---

## 3. Piano operativo tecnico Phase 2–5 (checklist + file da toccare)

### Phase 2 — Audit trail + proof hash (DB only)

| # | Azione | File da toccare | Tabelle/funzioni |
|---|--------|------------------|-------------------|
| 1 | Creare migrazione: tabella `final_shoot_audit` (id, event_type, mission_id, user_id, attempt_id, outcome, request_id, proof_hash, created_at) | Nuovo: `supabase/migrations/YYYYMMDD_final_shoot_audit.sql` | final_shoot_audit |
| 2 | Aggiungere colonna `proof_hash TEXT` a `final_shoot_winners`; nella RPC `execute_final_shoot`, dopo INSERT winner, calcolare hash e fare UPDATE su final_shoot_winners (o inserire in audit con proof_hash) | `supabase/migrations/20260126_004_*.sql` o nuovo migration | final_shoot_winners, execute_final_shoot |
| 3 | In `execute_final_shoot`: inserire riga in `final_shoot_audit` per ogni tentativo (e per winner) con request_id passato da client (opzionale) o NULL | Stesso migration / RPC | execute_final_shoot, final_shoot_audit |
| 4 | Creare migrazione: colonna `proof_hash TEXT` e `request_id UUID` su `marker_claims`; tabella `marker_claim_audit` se si vuole audit separato | Nuovo: `supabase/migrations/YYYYMMDD_marker_claim_audit.sql` | marker_claims, marker_claim_audit |
| 5 | In Edge `claim-marker-reward`: dopo insert claim, calcolare proof_hash e aggiornare `marker_claims.proof_hash`; inserire in `marker_claim_audit` se presente | `supabase/functions/claim-marker-reward/index.ts` | marker_claims, marker_claim_audit |

**Checklist Phase 2:** [ ] Migration final_shoot_audit + proof_hash su final_shoot_winners; [ ] RPC execute_final_shoot aggiornata; [ ] Migration marker_claims proof_hash/request_id + marker_claim_audit; [ ] Edge claim-marker-reward aggiornata; [ ] Test: tentativo Final Shoot e claim marker verificano presenza audit e proof_hash.

---

### Phase 3 — Antifrode log (IP/UA hash, request_id)

| # | Azione | File da toccare | Tabelle/funzioni |
|---|--------|------------------|-------------------|
| 1 | Creare tabella `antifraud_log` (id, event_type, user_id, request_id, ip_hash, ua_hash, resource_id, created_at) con RLS (solo service_role insert, admin select) | Nuovo migration | antifraud_log |
| 2 | Final Shoot: client invia header o body con request_id (UUID); RPC accetta p_request_id (nullable); se presente, scrive in final_shoot_audit. Opzione: proxy da Edge che legge X-Forwarded-For e User-Agent, genera request_id, chiama RPC e scrive antifraud_log | `src/components/final-shoot/FinalShootContext.tsx` (genera request_id), `execute_final_shoot` (parametro), eventuale Edge | antifraud_log, execute_final_shoot |
| 3 | Marker: in Edge già si ha accesso a req; generare request_id; hashar IP e UA (SHA-256); inserire in antifraud_log prima di claim | `supabase/functions/claim-marker-reward/index.ts` | antifraud_log |

**Checklist Phase 3:** [ ] Migration antifraud_log; [ ] Final Shoot: request_id + eventuale antifraud (client o Edge); [ ] Marker: request_id, ip_hash, ua_hash in antifraud_log; [ ] Documentare retention e base legale GDPR.

---

### Phase 4 — Email ufficiali (trigger/template + log)

| # | Azione | File da toccare | Tabelle/funzioni |
|---|--------|------------------|-------------------|
| 1 | Creare Edge Function `send-final-shoot-winner-email` (payload: user_id, mission_id, won_at); template HTML; log in `email_sends` o simile | Nuovo: `supabase/functions/send-final-shoot-winner-email/index.ts` | email_sends (se nuova tabella) |
| 2 | In RPC `execute_final_shoot`: dopo INSERT winner e prima di RETURN, invocare Edge (pg_net o HTTP) per send-final-shoot-winner-email — oppure trigger su final_shoot_winners che chiama Edge | Migration o RPC, trigger opzionale | execute_final_shoot, final_shoot_winners |
| 3 | Creare Edge `send-marker-prize-email` per physical_prize (user_id, prize_name, claim_code); log invio | Nuovo: `supabase/functions/send-marker-prize-email/index.ts` | claim-marker-reward (invoke), email_sends |
| 4 | In claim-marker-reward, dopo insert prize_claims per physical_prize: invoke send-marker-prize-email | `supabase/functions/claim-marker-reward/index.ts` | - |

**Checklist Phase 4:** [ ] Edge send-final-shoot-winner-email; [ ] Chiamata da RPC o trigger; [ ] Edge send-marker-prize-email; [ ] Integrazione in claim-marker-reward; [ ] Log email e test.

---

### Phase 5 — Transazioni atomiche complete (Marker)

| # | Azione | File da toccare | Tabelle/funzioni |
|---|--------|------------------|-------------------|
| 1 | Creare RPC `claim_marker_reward_rpc(p_user_id UUID, p_marker_id TEXT, p_request_id UUID, p_ip_hash TEXT, p_ua_hash TEXT)` che in una transazione: check claim, insert marker_claims, eroga tutti i reward (buzz, M1U, clues, prize_claims, notifications), insert audit, proof_hash | Nuovo migration con funzione PL/pgSQL | claim_marker_reward_rpc, marker_claims, buzz_grants, user_wallet/profiles (via admin_credit_m1u o inline), user_notifications, prize_claims, user_clues, event_tickets, user_badges |
| 2 | Refactor Edge claim-marker-reward: ottiene user da JWT, genera request_id, hasha IP/UA, chiama `claim_marker_reward_rpc` con service role; ritorna risultato | `supabase/functions/claim-marker-reward/index.ts` | - |
| 3 | Mantenere rate limit e push notification in Edge; solo la parte “claim + reward” va in RPC | Come sopra | - |

**Checklist Phase 5:** [ ] RPC claim_marker_reward_rpc implementata e testata; [ ] Edge refactor a thin wrapper; [ ] Test idempotenza e race; [ ] Rollback plan documentato.

---

## 4. Diff plan (senza diff)

- **Final Shoot:** Modifiche previste solo in migrazioni (nuove tabelle/colonne) e in una migrazione che sostituisce/aggiorna `execute_final_shoot` per scrivere audit e proof_hash. Frontend: eventuale aggiunta di generazione e passaggio di `request_id` (query param o header custom) in Phase 3.
- **Marker:** Migrazioni per marker_claims (colonne), marker_claim_audit, antifraud_log; nuova RPC in Phase 5; modifiche a `claim-marker-reward/index.ts` per audit, antifraud, email, infine chiamata a RPC unica.
- **Nessun refactor di logica di business** oltre a spostamento della logica reward da Edge a RPC in Phase 5.

---

## 5. Rischio e STOP conditions (annotati)

| Rischio | Dove | Azione |
|---------|------|--------|
| **RLS** | Nuove tabelle audit/antifraud | Policy: insert solo da service_role o da RPC SECURITY DEFINER; SELECT solo admin o stesso user ove consentito. |
| **SECURITY DEFINER** | execute_final_shoot, future claim_marker_reward_rpc | Mantenere search_path = public; non accettare input non validato come SQL. p_user_id deve coincidere con auth.uid() se chiamata da client (o da Edge con JWT). |
| **PII** | Antifraud (IP, UA) | Salvare solo hash; retention limitata; base giuridica e informativa privacy da aggiornare. |
| **Email provider** | Nuove Edge email | Riutilizzare stesso stack SMTP (send-welcome-email); non loggare email in chiaro in log pubblici. |

Se in Phase 2–5 emerge che RLS su tabelle esistenti blocca gli insert di audit da RPC, **STOP** e documentare: le RPC sono SECURITY DEFINER quindi bypassano RLS; le nuove tabelle devono avere policy che consentano insert dalla RPC (es. WITH CHECK (true) per insert da service_role).

---

## 6. Elenco file coinvolti (riepilogo)

**Final Shoot:**  
`supabase/migrations/20260126_004_final_shoot_balance_response.sql`, `20260117_001_final_shoot_atomic_winner.sql`, `20260117_003_aaa_hardening.sql`, `20251203_mission_command_center.sql`, `src/components/final-shoot/FinalShootContext.tsx`, `src/components/final-shoot/FinalShootOverlay.tsx`, `src/hooks/useFinalShoot.ts`.  
**Nuovi (Phase 2–5):** migrazioni per final_shoot_audit, proof_hash; eventuale Edge per email; opzionale proxy per antifraud.

**Marker:**  
`supabase/functions/claim-marker-reward/index.ts`, `supabase/functions/_shared/rateLimit.ts`, `supabase/migrations/20250814124057_ec3adf48-a39b-45ce-98f2-8df374b9c48f.sql`, `20250114_003_fix_marker_claims_visibility.sql`, `src/components/marker-rewards/ClaimRewardModal.tsx`, `src/pages/sandbox/map3d/layers/RewardsLayer3D.tsx`.  
**Nuovi (Phase 2–5):** migrazioni per marker_claim_audit, proof_hash, antifraud_log; RPC claim_marker_reward_rpc; Edge send-marker-prize-email.

**Tabelle coinvolte (esistenti):**  
final_shoot_attempts, final_shoot_winners, current_mission_data, missions, profiles, user_wallet; marker_rewards, marker_claims, buzz_grants, user_xp, event_tickets, user_badges, user_clues, prize_claims, user_notifications, admin_logs.

**Funzioni/RPC coinvolte:**  
execute_final_shoot, is_final_shoot_available, get_final_shoot_remaining, get_final_shoot_pricing; admin_credit_m1u, increment_xp.

---

## 7. Deliverables Phase 1 (completati)

- [x] Tag git: `safety/hardening-baseline-20260224-1158`
- [x] Report: `reports/HARDENING_PHASE1_BASELINE.md`
- [x] (Opzionale) `docs/SECURITY_AUDIT_PLAN.md` — creato separatamente

**Nessuna modifica funzionale applicata.** Analisi e piano pronti per Phase 2.

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
