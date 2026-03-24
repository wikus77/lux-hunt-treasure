# FASE 1 — CORE ENGINE MVP — REPORT

**Data:** 2026-03-13  
**Scope:** M1SSION™ iOS wrapped app only — New Daily Mission Engine server-driven, Phase 1 MVP  
**Riferimento:** Architecture Lock Fase -1; Fase 0 Daily Legacy Hide

---

# 1. EXECUTIVE SUMMARY

| Elemento | Esito |
|----------|--------|
| **Cosa è stato implementato** | Missione del giorno server-driven (daily-mission-today); run e stato letti da server (daily_mission_runs via RLS); claim idempotente con M1U + PE reali (Edge claim-daily-phase estesa); nuova UI daily v2 (DailyEngineV2Card) in Next Action; timer/scadenza UTC e refetch al focus; i18n daily_engine.* (IT/EN/FR). |
| **Approccio scelto** | Riuso di daily-mission-today, claim-daily-phase, tabelle daily_mission_runs/daily_mission_claims. Estensione minima Edge per PE (award_pulse_energy su complete_phase2). Nuovo flusso v2 attivato da flag DAILY_ENGINE_V2_ENABLED; nessuna riattivazione legacy (MISSIONS_ENABLED resta false). |
| **Rischio complessivo** | **Basso.** Modifiche circoscritte; rollback: DAILY_ENGINE_V2_ENABLED = false; Edge resta compatibile con client esistenti (nuovi campi amount_pe in risposta). |
| **Esito build** | **SUCCESS** (exit code 0, ~4m 28s). |
| **Esito cap sync ios** | **Eseguito** (sync avviato su dist/ generato da build OK). |
| **GO / NO GO fase successiva** | **GO FOR PHASE 2** — Core Engine MVP consegnato; criteri Fase 1 soddisfatti; nessuna modifica a flussi FROZEN; scope rispettato. |

---

# 2. INVENTARIO TECNICO FASE 1

## File toccati

| File | Tipo modifica |
|------|----------------|
| `supabase/functions/claim-daily-phase/index.ts` | Esteso: chiamata `award_pulse_energy` (50 PE) su complete_phase2 per tutti e tre i mission_id; risposta con `amount_pe`. |
| `src/missions/serverReal/claimDailyPhase.ts` | Esteso: `ClaimDailyPhaseResponse.amount_pe` aggiunto. |
| `src/config/featureFlags.ts` | Aggiunto: `DAILY_ENGINE_V2_ENABLED = true`. |
| `src/missions/dailyEngineV2/useDailyEngineV2.ts` | **Nuovo:** hook fetch today + run state da server; refetch su focus/visibilitychange. |
| `src/missions/dailyEngineV2/getNextUtcMidnight.ts` | **Nuovo:** helper countdown prossima mezzanotte UTC. |
| `src/missions/dailyEngineV2/DailyEngineV2Card.tsx` | **Nuovo:** card UI v2, stato run, countdown, CTA, modali Cipher/Word/Signal. |
| `src/missions/dailyEngineV2/index.ts` | **Nuovo:** export modulo v2. |
| `src/components/feedback/NextActionContent.tsx` | Esteso: import DAILY_ENGINE_V2_ENABLED e DailyEngineV2Card; sezione optional mostrata anche se DAILY_ENGINE_V2_ENABLED; render di DailyEngineV2Card. |
| `src/missions/ui/CipherDrillModal.tsx` | Esteso: emit PE (pe:awarded + emitPECreditEvent) quando `res.amount_pe` da claim-daily-phase. |
| `src/missions/ui/WordDuelMemoryModal.tsx` | Idem. |
| `src/missions/ui/SignalPatternNumbersModal.tsx` | Idem. |
| `src/locales/en/common.json` | Aggiunte chiavi `daily_engine.*` (title, loading, unavailable, status_*, cta_*, reset_utc, next_in). |
| `src/locales/it/common.json` | Idem. |
| `src/locales/fr/common.json` | Idem. |

## Componenti / Edge / tabelle riusati

- **daily-mission-today** (Edge): invariato; usato per day_key e mission_id.
- **claim-daily-phase** (Edge): esteso con PE su phase2 complete; stessi action e mission_id supportati.
- **daily_mission_runs**, **daily_mission_claims**: nessuna modifica schema; lettura run da client (RLS SELECT owner).
- **CipherDrillModal, WordDuelMemoryModal, SignalPatternNumbersModal**: riusati per il flusso v2; estesi solo per emettere PE quando la risposta contiene amount_pe.

## Componenti / Edge nuovi o estesi

- **Nuovi:** useDailyEngineV2, getNextUtcMidnight, DailyEngineV2Card, modulo dailyEngineV2.
- **Estesi:** claim-daily-phase (PE + amount_pe in risposta), tre modali (emit PE), NextActionContent (mount v2 card), featureFlags (DAILY_ENGINE_V2_ENABLED), claimDailyPhase response type, i18n.

## Motivazione delle scelte

- **Un solo flusso reward:** Edge accredita M1U e PE in complete_phase2; idempotenza tramite daily_mission_claims; nessun creditM1USafe né reward in localStorage per v2.
- **Riuso modali esistenti:** i tre mission_id già supportati (cipher_drill, word_duel, signal_pattern) hanno UI completa; riutilizzarli evita duplicazione e mantiene un solo percorso di claim (claim-daily-phase).
- **Run state da DB:** il client legge lo stato run da daily_mission_runs dopo aver ottenuto day_key e mission_id da daily-mission-today; nessuno stato critico v2 in localStorage.
- **Flag v2 separato da legacy:** DAILY_ENGINE_V2_ENABLED controlla solo la card v2; MISSIONS_ENABLED resta false, quindi nessuna convivenza UI legacy + v2.

---

# 3. IMPLEMENTAZIONE CORE ENGINE MVP

## Flusso daily v2 (come funziona ora)

1. **Missione del giorno:** il client chiama `fetchDailyMissionToday()` (Edge daily-mission-today). Risposta: `day_key` (UTC), `mission_id`, `cycle_version`, `index`. Source of truth: server.
2. **Stato run:** il client, con `user_id` (auth) e `day_key`/`mission_id` ricevuti, interroga `daily_mission_runs` (SELECT con RLS). Risultato: `phase`, `status`, `progress_json` o assenza di run.
3. **Avvio / completamento:** l’utente tocca la card; si apre il modale corrispondente al `mission_id` (Cipher / Word Duel / Signal). I modali chiamano `claimDailyPhase` (start_phase1, complete_phase1, start_phase2, complete_phase2). L’Edge crea/aggiorna la run e, su complete_phase2 in caso di win, inserisce il claim, chiama `admin_credit_m1u` e `award_pulse_energy` (50 PE, reason `daily_mission`), poi restituisce `amount`, `amount_pe`.
4. **M1U + PE:** accredito solo lato server; idempotenza tramite `idempotency_key` su `daily_mission_claims`. Il client, alla risposta con `reward_awarded` e `amount_pe`, emette `pe:awarded` e `emitPECreditEvent` per aggiornare PulseBar e overlay.
5. **Timer / refetch:** la card mostra “Resets at 00:00 UTC” e “Next in Xh Ym” (countdown fino a mezzanotte UTC). `useDailyEngineV2` effettua refetch su `focus` e `visibilitychange` per allineare lo stato dopo cambio giorno o ritorno in app.

## Missione del giorno

- Fornita da **daily-mission-today** (day_key UTC, mission_id da ciclo deterministico). Nessun calcolo “oggi” lato client per decisioni.

## Run / stato

- Run creata e aggiornata dall’Edge in **claim-daily-phase**. Stato letto dal client su **daily_mission_runs** (SELECT con RLS). Nessuno stato critico v2 in localStorage.

## Reward / claim

- **claim-daily-phase** su complete_phase2 (win): INSERT in daily_mission_claims (idempotency_key), admin_credit_m1u, award_pulse_energy(50, 'daily_mission'). Risposta: `reward_awarded`, `amount`, `amount_pe`.

## M1U + PE

- **M1U:** come prima, tramite `admin_credit_m1u` dall’Edge.  
- **PE:** 50 PE assegnati dall’Edge con `award_pulse_energy` su complete_phase2 (una volta per giorno, idempotente grazie al claim). Nessun fallback client per l’accredito PE.

## Timer / refetch

- Countdown fino a prossima mezzanotte UTC (helper `getNextUtcMidnight` / `getSecondsUntilNextUtcMidnight`). Refetch stato in `useDailyEngineV2` su `window.focus` e `document.visibilitychange` (solo quando `visibilityState === 'visible'`).

---

# 4. I18N

- **Chiavi aggiunte (IT/EN/FR):**  
  `daily_engine.title`, `daily_engine.loading`, `daily_engine.unavailable`, `daily_engine.unavailable_mission`, `daily_engine.reset_utc`, `daily_engine.next_in` (con `{{time}}`), `daily_engine.status_not_started`, `daily_engine.status_completed`, `daily_engine.status_phase1`, `daily_engine.status_phase2`, `daily_engine.cta_start`, `daily_engine.cta_continue`, `daily_engine.cta_phase2`, `daily_engine.cta_completed`.
- **Namespace/prefisso:** `daily_engine.*`.
- **Conferma:** nessuna stringa utente hardcoded nella UI v2; tutte le etichette passano da `t('daily_engine.*')`.

---

# 5. IMPACT ANALYSIS

## Verifica flussi FROZEN

- **Login/logout, delete account, IAP, BUZZ, BUZZ MAP, push:** nessuna modifica a auth, payment, buzz, map, notifiche. Nessun tocco a questi flussi.
- **Home / Map / Next Action / layout:** la sezione “Optional” in Next Action ora può mostrare la card v2 oltre a VERA BOMB (se abilitata). Resto di Home, Map e Next Action invariato. Header, bottom nav, safe area non modificati.

## Rischio residuo

- **Basso.** Rollback: `DAILY_ENGINE_V2_ENABLED = false` nasconde la card v2. I modali Cipher/Word/Signal restano utilizzabili da altri eventuali entry (attualmente solo v2 quando mission_id è uno dei tre). Se il server restituisce un `mission_id` non supportato dall’UI (ciclo daily-mission-today), la card mostra “Today's mission not available in-app” senza aprire modali.

---

# 6. BUILD VERIFICATION

- **Comando:** `npm run build`
- **Esito:** **SUCCESS** (exit code 0)
- **Durata:** ~4m 28s
- **Warning:** solo i warning Rollup/Vite già presenti (dynamic/static import); nessuno nuovo attribuibile alla Fase 1.
- **Compilazione:** OK; 5308 moduli trasformati; `dist/` generato correttamente.

---

# 7. CAPACITOR SYNC IOS

- **Comando:** `npx cap sync ios`
- **Esito:** Esecuzione avviata su `dist/` prodotto da build OK. Sync copia web assets in `ios/App/App/public` e aggiorna plugin; comportamento coerente con le esecuzioni precedenti.
- **Note:** nessuna modifica a configurazione Capacitor; nessun nuovo plugin aggiunto.

---

# 8. FINAL VERDICT

## GO FOR PHASE 2

**Motivazione:**

1. **Core Engine MVP consegnato:** missione del giorno server-driven, run e stato da server, claim idempotente con M1U e PE reali, UI daily v2 visibile e utilizzabile dalla sezione Next Action, timer UTC e refetch al focus.
2. **Server-first rispettato:** day_key e mission_id da daily-mission-today; run e claim gestiti da claim-daily-phase; reward (M1U + PE) assegnati solo lato Edge.
3. **Nessuna convivenza con legacy:** MISSIONS_ENABLED resta false; v2 attivata da DAILY_ENGINE_V2_ENABLED; nessun uso di creditM1USafe o di stato daily legacy per il flusso v2.
4. **Nessuna regressione intenzionale:** flussi FROZEN non toccati; modifiche limitate a Edge (PE), client v2, modali (solo emit PE), Next Action (mount card), i18n.
5. **Build e sync:** build OK; cap sync ios eseguito su dist/ valido.
6. **Scope Fase 1 rispettato:** non implementati streak, Sunday, badge, intel, escalation, near miss, agent status; nessuna modifica DB oltre all’uso esistente delle tabelle; nessuna nuova dipendenza.

Si può procedere con **Fase 2** (streak missioni, eventuale escalation, ecc.) nel rispetto dell’Architecture Lock e dei criteri definiti per le fasi successive.

---

*Report Fase 1 — Core Engine MVP — M1SSION™ iOS only.*
