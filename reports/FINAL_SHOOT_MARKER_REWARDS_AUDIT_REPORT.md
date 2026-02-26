# FINAL SHOOT & MARKER REWARDS — Audit Report (Read-Only Forensics)

**Repo:** `/Users/josephmule/lux-hunt-treasure`  
**Scope:** Final Shoot system, Marker Rewards system  
**Mode:** 100% read-only analysis — no code/config changes  
**Date:** 2026-02-24

---

## Executive Summary

- **Final Shoot:** La vincita è **determinata e persistita lato server** tramite RPC `execute_final_shoot`. Esiste un lock atomico “first winner” (un vincitore per missione), tentativi e vincitore sono salvati in DB. **Nessuna email automatica al vincitore**; esiste solo notifica push “Final Shoot attivo” (7 giorni prima della fine missione). Tracciabilità: tabelle `final_shoot_attempts`, `final_shoot_winners`; nessun proof hash, IP log o device fingerprint dedicato.
- **Marker Rewards:** Il claim è **server-side** tramite Edge Function `claim-marker-reward`. Persistenza in `marker_claims` (UNIQUE marker_id + user_id) e tabelle reward-specifiche. Idempotenza garantita da check + insert (piccola finestra di race). **Nessuna email al claim**; solo push e notifiche in-app. Tracciabilità: `marker_claims`, `user_notifications`, log Edge; nessun proof hash o IP/device dedicato.
- **Prova legale vincita:** **PARZIALE** per entrambi: si può dimostrare chi ha vinto e quando (user_id, timestamp, mission_id/marker_id), ma non esiste catena di proof (hash/firma), né log IP/device, né email di conferma automatica.
- **Production readiness:** Stimata **6–7/10**; **Legal defensibility:** **5–6/10**. Miglioramenti consigliati solo in forma di raccomandazioni (nessuna patch proposta).

---

## 1. FINAL SHOOT — Technical Findings

### 1.1 Trigger e dove viene chiamato

| Aspetto | Dettaglio |
|--------|-----------|
| **Dove** | Frontend: `src/components/final-shoot/FinalShootContext.tsx` (production) e `src/hooks/useFinalShoot.ts`. Click sulla mappa → `executeShoot(lat, lng)`. |
| **Chiamata** | `supabase.rpc('execute_final_shoot', { p_user_id, p_mission_id, p_lat, p_lng })` — **solo da client autenticato**. |
| **Attivo** | Sì: RPC esposta, gating da `is_final_shoot_available(p_mission_id)` (ultimi 7 giorni), tentativi da `get_final_shoot_remaining` / pricing. |
| **Gating** | Server-side: finestra temporale (7 giorni prima della fine missione), cap tentativi (3 free + paid fino a 23), saldo M1U per tentativi a pagamento. |
| **RPC** | `public.execute_final_shoot(UUID, UUID, DOUBLE PRECISION, DOUBLE PRECISION)` — **SECURITY DEFINER**, `search_path = public`. |
| **Client vs server** | **Server-validated**: coordinate premio solo in DB (`current_mission_data.prize_lat/lng`); distanza e “winner” calcolati in RPC (Haversine, tolleranza 19 m). |

**File coinvolti:**
- `src/components/final-shoot/FinalShootContext.tsx` (executeShoot, RPC call)
- `src/components/final-shoot/FinalShootOverlay.tsx` (click map → executeShoot)
- `supabase/migrations/20260126_004_final_shoot_balance_response.sql` (RPC attuale)
- `supabase/migrations/20251203_mission_command_center.sql` (is_final_shoot_available, get_final_shoot_remaining, schema iniziale)

---

### 1.2 Validazione vincita e persistenza

| Aspetto | Dettaglio |
|--------|-----------|
| **Dove viene salvato** | Tentativo: `public.final_shoot_attempts`. Vincitore: `public.final_shoot_winners`. |
| **Tabelle** | `final_shoot_attempts` (user_id, mission_id, attempt_lat, attempt_lng, distance_meters, is_winner, attempt_number, cost_m1u, tier, charged); `final_shoot_winners` (mission_id PK, winner_user_id, attempt_id, won_at, distance_meters). |
| **user_id** | Sempre da parametro RPC `p_user_id` (JWT/RLS garantiscono che il client non possa impersonare). |
| **Transazionale** | Sì: tutta la logica in un’unica funzione PL/pgSQL (charge M1U, insert attempt, insert winner se is_winner). |
| **Atomico** | Sì: vincitore con `INSERT ... ON CONFLICT (mission_id) DO NOTHING` + successiva SELECT per stabilire se “siamo noi” il vincitore; race gestita (race_lost / race_error). |
| **Race condition** | Protetta: un solo vincitore per missione (PK su mission_id); chi arriva secondo riceve status `race_lost` e non viene scritto in `final_shoot_winners`. |

---

### 1.3 Prova reale vincita (proof, audit, server-side)

| Elemento | Presente | Note |
|----------|----------|------|
| **timestamp** | Sì | `final_shoot_attempts.created_at`, `final_shoot_winners.won_at`. |
| **user_id persistito** | Sì | `winner_user_id`, `user_id` in attempts. |
| **premio/missione** | Sì | `mission_id`, `attempt_id` (link al tentativo vincente). |
| **proof hash** | No | Nessun hash del tentativo o della vincita. |
| **audit log** | Parziale | Record in tabelle; nessuna tabella `audit_log` dedicata per Final Shoot. |
| **Firma digitale** | No | Non implementata. |
| **IP log** | No | Non registrato in RPC/tabelle. |
| **Device fingerprint** | No | Non inviato né salvato. |
| **Verifica server-side** | Sì | Vincita calcolata solo in RPC (distanza ≤ 19 m rispetto a coordinate in DB). |

**Conclusione:** La vincita è **reale e server-side**; mancano proof crittografici e log di contesto (IP/device).

---

### 1.4 Email al vincitore

| Domanda | Risposta |
|--------|----------|
| **Email automatica al vincitore?** | **No.** Nessuna Edge Function o trigger che invii email quando un utente vince il Final Shoot. |
| **Servizio email** | Per altri flussi: `send-welcome-email`, `send-contact-email` (SMTP); nessun uso per “prize won”. |
| **final-shoot-notify** | Edge Function **solo** per notifica push “Final Shoot attivo” 7 giorni prima della fine missione (`supabase/functions/final-shoot-notify/index.ts`). Non invia email e non è legata all’evento “vincita”. |
| **Collegamento vincita → email** | Non presente. |
| **Log email** | N/A per Final Shoot winner. |

---

### 1.5 Anti-abuse

| Meccanismo | Stato |
|------------|--------|
| **Ripetizione vincita** | Bloccata: un solo record per missione in `final_shoot_winners`; se già esistente, RPC restituisce already_won / already_claimed e eventuale refund. |
| **Manipolazione** | Coordinate premio solo in DB; client invia solo (lat, lng). Winner calcolato server-side. |
| **Idempotenza tentativi** | Ogni click è un tentativo distinto (insert in final_shoot_attempts); M1U addebitati per tentativo. “Already won” evita tentativi inutili dopo vittoria. |
| **Replay** | Nessun nonce/token replay-specifico; l’RPC è invocabile più volte (consuma tentativi/M1U). Mitigazione: cap tentativi e un vincitore per missione. |
| **Doppio click** | Nessun lock lato UI; due click rapidi → due chiamate RPC → due tentativi (e due addebiti se a pagamento). **Rischio:** doppio tentativo per doppio tap. |
| **Refresh** | Stato “hasWon” e tentativi rimanenti vengono da DB/RPC; il refresh non ripete la vincita (già scritta). |
| **Multi-device** | Stesso user_id su più device: tentativi e vincita condivisi; comportamento corretto. |

---

### 1.6 Stato reale Final Shoot

| Criterio | Esito |
|----------|--------|
| Funziona davvero (server-side) | Sì |
| Parzialmente (manca email, proof, IP) | Sì (mancanze indicate sopra) |
| Non implementato | No (core implementato) |
| Solo frontend | No (logica e persistenza server) |

**Riepilogo:** **FUNZIONA DAVVERO** con validazione e persistenza server-side; **PARZIALE** su proof legale, email e anti-doppio-click.

---

## 2. MARKER REWARDS — Technical Findings

### 2.1 Trigger reale

| Aspetto | Dettaglio |
|--------|-----------|
| **Dove** | Frontend: `src/components/marker-rewards/ClaimRewardModal.tsx`, `src/pages/sandbox/map3d/layers/RewardsLayer3D.tsx`; hook/map usano `supabase.functions.invoke('claim-marker-reward', { body: { markerId } })`. |
| **Attivo** | Sì: Edge Function `claim-marker-reward` deployata; utente autenticato (JWT), rate limit applicato. |
| **Flusso** | Client → Edge Function → check already claimed (admin client) → insert `marker_claims` → processa reward (buzz_grants, M1U RPC, user_notifications, ecc.). |

**File coinvolti:**
- `supabase/functions/claim-marker-reward/index.ts`
- `src/components/marker-rewards/ClaimRewardModal.tsx`
- `src/pages/sandbox/map3d/layers/RewardsLayer3D.tsx`
- `src/hooks/useMarkerRewards.ts` (se presente) / uso in MapTiler3D e RewardsLayer3D

---

### 2.2 Persistenza DB

| Tabella / RPC | Ruolo |
|---------------|--------|
| **marker_rewards** | Configurazione reward per marker (reward_type, payload, description). |
| **marker_claims** | Un record per (marker_id, user_id); UNIQUE(marker_id, user_id). Claim creato con admin client prima di erogare reward. |
| **buzz_grants, user_xp, event_tickets, user_badges, user_clues, prize_claims, user_notifications** | Aggiornate in base a reward_type (M1U via `admin_credit_m1u` RPC). |

**Transazione:** La Edge Function non usa una transazione DB esplicita; ordine: 1) check existing claim, 2) insert marker_claims, 3) loop su rewards. Se l’insert fallisce (es. unique violation), ritorna 500; se l’insert va a buon fine e poi fallisce un reward, il claim resta registrato (possibile stato incoerente su singolo reward).

---

### 2.3 Proof vincita (Marker)

| Elemento | Presente | Note |
|----------|----------|------|
| **timestamp** | Sì | `marker_claims` ha `claimed_at` (se presente nello schema; in migrazioni è spesso solo created_at su insert). |
| **user_id / marker_id** | Sì | Salvati in `marker_claims`. |
| **Proof hash / firma** | No | Non implementato. |
| **Audit log** | Parziale | Log in Edge (M1QR-TRACE); `admin_logs` per physical_prize; nessuna tabella audit generica per claim. |
| **IP / device** | No | Non registrati. |

---

### 2.4 Email (Marker)

| Domanda | Risposta |
|--------|----------|
| **Email al claim?** | **No.** Nessuna chiamata a send-welcome-email / Mailjet / SendGrid da `claim-marker-reward`. |
| **Notifiche** | Push (webpush-targeted-send) e insert in `user_notifications` (in-app). |

---

### 2.5 Idempotenza e anti-abuse (Marker)

| Meccanismo | Stato |
|------------|--------|
| **Già claimato** | Check con admin client su `marker_claims` per (user_id, marker_id) prima dell’insert; se esistente ritorna ALREADY_CLAIMED. |
| **Unique DB** | UNIQUE(marker_id, user_id) su `marker_claims`: secondo insert stesso user+marker fallirebbe con constraint violation. |
| **Race (TOCTOU)** | Finestra tra “check” e “insert”: due richieste parallele per stesso user+marker possono entrambe passare il check; una va a buon fine, l’altra riceve claim_failed (500). Comportamento accettabile ma uno dei due chiamanti vede errore. |
| **Rate limit** | `applyRateLimit(req, 'claim-marker-reward', user_id)` in Edge Function. |
| **Doppio click** | Nessun lock UI; doppia invocazione può generare una 200 e una 500 (idempotenza da DB). |
| **Validazione server** | Sì: JWT obbligatorio; reward letti da DB; M1U tramite RPC; claim scritto server-side. |

---

### 2.6 Stato reale Marker Rewards

| Criterio | Esito |
|----------|--------|
| Trigger reale | Sì (Edge Function) |
| Persistenza DB | Sì (marker_claims + tabelle reward) |
| Proof vincita | Parziale (record, no hash/firma) |
| Email | No |
| Idempotenza | Sì (check + unique constraint) |
| Anti-abuse | Parziale (rate limit, unique; no IP/device) |
| Validazione server | Sì |
| Logging | Parziale (Edge logs, admin_logs per physical) |
| Tracciabilità | Sì (marker_claims, user_notifications, admin_logs per prize) |

---

## 3. PROVA LEGALE VINCITA

**Scenario:** Utente X vince premio Y (Final Shoot o Marker).

| Domanda | Final Shoot | Marker |
|---------|-------------|--------|
| Si può dimostrare che l’ha vinto davvero? | **Sì** (record in DB, server-side). | **Sì** (marker_claims + reward erogati). |
| Si può dimostrare che è stato lui? | **Sì** (winner_user_id / user_id da auth). | **Sì** (user_id in marker_claims). |
| Si può escludere manipolazione? | **Parziale** (nessun hash/firma; coordinate premio solo server). | **Parziale** (nessun hash; claim server-side). |
| Si può escludere bug? | **Parziale** (logica chiara; nessun audit trail crittografico). | **Parziale** (stesso). |
| Si può escludere exploit? | **Parziale** (rate limit su marker; Final Shoot senza rate limit RPC; nessun log IP). | **Parziale** (rate limit sì; no IP/device). |
| Doppia assegnazione? | **No** (un vincitore per missione; ON CONFLICT DO NOTHING). | **No** (unique marker_id+user_id). |

**Risposta complessiva:** **PARZIALMENTE**. Dimostrabili: chi ha vinto, quando, e che l’assegnazione è unica. Non dimostrabili con gli attuali dati: assenza di manipolazione/exploit (mancano proof hash, log IP/device, email di conferma).

---

## 4. ARCHITETTURA — Valutazione e migliorabilità

### 4.1 Valutazione

| Criterio | Valutazione |
|----------|-------------|
| **Production-ready** | Parziale: logica core solida; mancano email al vincitore, proof legali, mitigazione doppio click (Final Shoot). |
| **Auditabile** | Parziale: dati in DB e log Edge; nessun audit log strutturato né hash/firma. |
| **Scalabile** | Adeguata per carichi moderati; RPC e Edge stateless. |
| **GDPR** | Parziale: user_id e timestamp sono dati personali; retention e diritto all’oblio dipendono da policy non analizzate qui. |
| **Transaction safe** | Final Shoot: sì (una funzione, refund su errori). Marker: parziale (nessuna transazione esplicita multi-tabella in Edge). |
| **ACID** | Final Shoot: sì. Marker: insert claim + N aggiornamenti non in una singola transazione DB. |

### 4.2 Miglioramenti consigliati (solo analisi, nessuna patch)

| Dove | Perché | Rischio attuale | Livello | Priorità |
|------|--------|------------------|---------|----------|
| **Final Shoot: email al vincitore** | Tracciabilità e prova consegna “comunicazione” al vincitore. | Nessuna email = nessun record esterno di notifica vincita. | MEDIUM | Alta |
| **Final Shoot: proof hash (attempt_id + user_id + won_at)** | Prova di integrità del record di vincita. | Impossibilità di dimostrare non alterazione. | MEDIUM | Media |
| **Final Shoot: mitigazione doppio click** | Evitare due tentativi (e doppio addebito M1U) per un solo tap. | Doppio addebito, confusione utente. | LOW | Media |
| **Marker: transazione DB** | Allineare claim + erogazione reward in un’unica transazione. | Possibile claim senza reward o reward senza claim in caso di errore. | MEDIUM | Alta |
| **Marker: email opzionale al claim (es. physical prize)** | Prova di notifica per premi fisici. | Solo in-app/push; nessun record email. | LOW | Bassa |
| **Entrambi: log IP/request id in audit table** | Contestualizzare tentativo/claim (antifrode). | Nessun contesto richiesta per dispute. | MEDIUM | Media |
| **Final Shoot: rate limit sull’RPC** | Limitare abuso di tentativi ripetuti. | Abuso possibile a livello di chiamate. | LOW | Bassa |

---

## 5. File References (principali)

### Final Shoot
- `supabase/migrations/20260126_004_final_shoot_balance_response.sql` — RPC `execute_final_shoot` (versione con balance_after)
- `supabase/migrations/20260117_001_final_shoot_atomic_winner.sql` — Tabella `final_shoot_winners`, lock atomico
- `supabase/migrations/20260117_003_aaa_hardening.sql` — Trigger immutable su `final_shoot_winners`
- `supabase/migrations/20251203_mission_command_center.sql` — `is_final_shoot_available`, `get_final_shoot_remaining`, `current_mission_data`, schema attempts
- `src/components/final-shoot/FinalShootContext.tsx` — Chiamata RPC, gestione stato
- `src/components/final-shoot/FinalShootOverlay.tsx` — Click su mappa
- `supabase/functions/final-shoot-notify/index.ts` — Push “Final Shoot attivo” (7 giorni prima), non email vincita

### Marker Rewards
- `supabase/functions/claim-marker-reward/index.ts` — Logica claim, rate limit, M1U, notifications
- `supabase/migrations/20250814124057_ec3adf48-a39b-45ce-98f2-8df374b9c48f.sql` — marker_rewards, marker_claims (UNIQUE)
- `supabase/migrations/20250114_003_fix_marker_claims_visibility.sql` — RLS marker_claims
- `src/components/marker-rewards/ClaimRewardModal.tsx` — Invoke Edge Function
- `src/pages/sandbox/map3d/layers/RewardsLayer3D.tsx` — Integrazione mappa

### DB / RPC
- Tabelle: `final_shoot_attempts`, `final_shoot_winners`, `current_mission_data`, `marker_rewards`, `marker_claims`, `user_notifications`, `admin_logs` (physical prize)
- RPC: `execute_final_shoot`, `get_final_shoot_pricing`, `is_final_shoot_available`, `get_final_shoot_remaining`, `admin_credit_m1u`

---

## 6. Risk Matrix

| Rischio | Probabilità | Impatto | Livello | Sistema |
|---------|-------------|---------|---------|---------|
| Doppia assegnazione premio | Bassa | Alto | MEDIUM | Mitigato (DB constraint / ON CONFLICT) |
| Vincita solo client / manipolata | Bassa | Alto | MEDIUM | Mitigato (server-side) |
| Nessuna prova legale robusta | Certa | Medio | MEDIUM | Aperto (no hash, no IP, no email) |
| Doppio tentativo/doppio addebito (Final Shoot) | Media | Basso | LOW | Aperto |
| Claim senza reward o reward senza claim (Marker) | Bassa | Medio | MEDIUM | Aperto (no transazione) |
| Abuso rate (Final Shoot RPC) | Bassa | Basso | LOW | Aperto |

---

## 7. Scores

| Score | Valore | Nota |
|-------|--------|------|
| **Production Readiness** | **6.5/10** | Core funzionante e server-side; mancano email vincita, proof, transazione Marker, mitigazione doppio click. |
| **Legal Defensibility** | **5.5/10** | Chi e quando è dimostrabile; mancano proof di integrità, contesto richiesta (IP/device), email di conferma. |

---

## 8. Recommended Improvements (no code)

1. **Final Shoot:** Introdurre invio email al vincitore (stesso stack SMTP già usato altrove), con log “email inviata” e conservazione per dispute.
2. **Final Shoot:** Aggiungere una colonna o tabella di audit con hash (es. SHA-256 di attempt_id + winner_user_id + won_at + mission_id) per prova di integrità.
3. **Final Shoot:** Disabilitare temporaneamente il pulsante / ignorare tentativi duplicati entro N secondi dall’ultimo tentativo (anti doppio click).
4. **Marker:** Eseguire claim + erogazione reward in un’unica transazione DB (es. funzione RPC o transazione esplicita in Edge).
5. **Entrambi:** Registrare in una tabella audit (o log strutturato) request_id, timestamp, user_id, IP (opzionale, nel rispetto GDPR), esito, per tentativi Final Shoot e claim Marker.
6. **Marker:** Per reward tipo physical_prize, considerare invio email con claim code e breve descrizione premio.
7. **Final Shoot:** Valutare rate limit sull’RPC (per utente o per missione) per limitare tentativi massivi.

---

**Fine report. Nessuna modifica è stata apportata al codice o alla configurazione.**

© 2026 Joseph MULÉ — M1SSION™ — NIYVORA KFT™
