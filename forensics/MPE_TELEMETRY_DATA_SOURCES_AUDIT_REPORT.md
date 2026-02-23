# M1SSION PROFILE ENGINE — Telemetry & Data Sources Audit Report (READ-ONLY)

**Product:** M1SSION™ (Capacitor iOS WKWebView)  
**Feature:** Mission Profile Engine / Agent Performance Calculator™  
**Scope:** READ-ONLY audit — no code/config/SQL/Edge/iOS changes.  
**Date:** 2026-02-23  
**Signature:** Lovable Agent JLENIA  

---

## 1. MAPPA FILE E COMPONENTI DEL PROFILE ENGINE

| File | Ruolo |
|------|--------|
| `src/components/missionProfileEngine/MissionProfileEngineSheet.tsx` | Sheet principale: stati idle/scan/report, close, drag-to-dismiss, header. |
| `src/components/missionProfileEngine/MissionProfileEnginePill.tsx` | Pill sotto BUZZ: titolo brand, subtitle, badge FREE, onPress → apre sheet. |
| `src/components/missionProfileEngine/MissionProfileEngineScan.tsx` | Scan HUD: progress bar, steps (Reading Intel…, Measuring Geo…, ecc.), abort, haptics. |
| `src/components/missionProfileEngine/MissionProfileEngineRing.tsx` | Ring gauge per report (percentage). |
| `src/lib/missionProfileEngine/fakeReport.ts` | Report **simulato** (seed giornaliero, clamp 5–95). **Nessun dato reale.** |
| `src/lib/missionProfileEngine/types.ts` | Tipi UI: `AgentPerformanceReport`, `ScanStep`. |
| `src/lib/missionProfileEngine/scanTimings.ts` | Durate step scan (buildScanSteps). |
| `src/pages/BuzzPage.tsx` | Integrazione: pill MPE (feature-flagged) sotto card BUZZ. |
| `src/locales/{en,fr,it}/common.json` | Chiavi `mission_profile_engine_*` (titoli, CTA, “Extra analysis — 5 M1U”). |

**Conclusione:** Il motore oggi è **UI-only**: report da `getFakeReport()`, nessun binding a tabelle/RPC reali.

---

## 2. INVENTARIO FONTI DATI (CON PROVE)

### 2.1 Activity / time on app & map

| Item | Dove | Lettura / Scrittura | Affidabilità |
|------|------|---------------------|--------------|
| **Tabella** | `user_activity_stats` | Migrations: `supabase/migrations/20251203_smart_push_system.sql`, `20251203_smart_push_templates_SIMPLE.sql` | Alta (esiste) |
| **RPC** | `update_user_activity(p_user_id, p_page, p_seconds, p_lat?, p_lng?)` | Scrittura: `src/hooks/useActivityTracker.ts` L42, L92 | Alta |
| **Lettura** | **Nessuna** in app. Solo Edge: `supabase/functions/smart-push-engine/index.ts` L167 `.from('user_activity_stats')` | **Solo server-side** | N/A client |

**Campi rilevanti (migration):**  
`time_on_home`, `time_on_map`, `time_on_buzz`, `time_on_intelligence`, `time_on_leaderboard`, `total_sessions`, `last_session_at`, `days_active_this_week`, `current_streak`, `longest_streak`, `last_known_lat`, `last_known_lng`.

**RLS:** Policy "Users can read own activity" / "Users read own activity" (SELECT dove `auth.uid() = user_id`). Lettura consentita; **manca** uso in client (nessun hook che faccia SELECT su `user_activity_stats`).

---

### 2.2 Streak / daily check-in

| Item | Dove | Lettura / Scrittura | Affidabilità |
|------|------|---------------------|--------------|
| **Source of truth** | `profiles`: `current_streak_days`, `longest_streak_days`, `last_check_in_date` | Migration: `supabase/migrations/20251004081340_95e746be_*.sql`, `20251130_streak_badges_system.sql` | Alta |
| **RPC** | `get_user_streak_info(p_user_id)` | Backup/migration: ritorna JSON con streak, longest_streak, last_check_in. Usato: `src/components/gamification/StreakWidget.tsx` L104 (RPC) + fallback SELECT profiles | Alta |
| **Edge** | `handle-daily-checkin` | `supabase/functions/handle-daily-checkin/index.ts`: legge profile, aggiorna streak e `last_check_in_date` | Alta |
| **UI** | StreakModal, StreakPill, DailyCheckInButton | SELECT su `profiles` (current_streak_days, last_check_in_date, longest_streak_days) | Alta |

**Lettura MPE:** possibile da `profiles` (stesso SELECT) o RPC `get_user_streak_info`. **Nessun mismatch** su questi campi in `types.ts` per `profiles` — ma in `src/integrations/supabase/types.ts` la tabella `profiles` **non** espone `current_streak_days`, `longest_streak_days`, `last_check_in_date` (vedi sezione 3). **BLOCKER potenziale:** types generati potrebbero non includere le colonne streak.

---

### 2.3 BUZZ clues

| Item | Dove | Lettura / Scrittura | Affidabilità |
|------|------|---------------------|--------------|
| **Tabella** | `user_clues` | Insert: `handle-buzz-press`, `claim-marker-reward`; count: `useMissionStatus.ts` L78–80 (SELECT count) | Alta |
| **Conteggio** | `useMissionStatus` | `src/hooks/useMissionStatus.ts`: user_clues count + user_notifications (buzz) + buzz_map_actions clue_count; max dei tre come “real count” | Alta (derived) |
| **week_number / week** | Schema | Backup: `user_clues` ha `week_number`. Migration `20251213_fix_user_clues_and_enrollment.sql`: aggiunge colonna **`week`** (INTEGER), non `week_number`. | **Drift:** DB può avere `week`; backup/types potrebbero riflettere `week_number`. |
| **types.ts** | `user_clues` Row | `src/integrations/supabase/types.ts` L1593–1630: **mancano** `week`, `week_number`, `clue_category`, `prize_id`, `location_id`. Solo: buzz_cost, clue_id, clue_type, created_at, description_it, id, metadata, title_it, unlocked_at, user_id. | **BLOCKER / drift:** colonne usate in backend assenti nei types. |

**Clue relevance/usage:** non presente come concetto in schema. **GAP.**

---

### 2.4 Buzz Map areas

| Item | Dove | Lettura / Scrittura | Affidabilità |
|------|------|---------------------|--------------|
| **Tabella** | `user_map_areas` | Colonne: id, user_id, lat, lng, radius_km, week, source, level, created_at, center_lat, center_lng, active, price_eur. RLS: SELECT own. | Alta |
| **Tabella** | `buzz_map_actions` | Log azioni pagamento/creazione area. RLS: SELECT own. | Alta |
| **Hook** | `useBuzzMapLogic` | `src/hooks/useBuzzMapLogic.ts`: SELECT `user_map_areas` eq user_id, source='buzz_map', week=currentWeek, order created_at desc, limit 1. Restituisce “current” area (radius_km, lat, lng, week). | Alta |
| **Raggio attivo** | `radius_km` | Letto da `user_map_areas.radius_km` (useBuzzMapLogic, MapTiler3D, BuzzMapButtonSecure, handle-buzz-press, buzz-map-resolve-v2). | Alta |
| **Count settimanale** | Derivable | Count `user_map_areas` WHERE user_id AND source='buzz_map' AND week=current_week. Non esposto da hook dedicato; useBuzzMapProgressivePricing fa count su `user_map_areas` per pricing. | Media (derived) |

**Overlap / frequency map interaction:** non definiti in schema. **GAP.**

---

### 2.5 Wallet M1U + Cashback

| Item | Dove | Lettura / Scrittura | Affidabilità |
|------|------|---------------------|--------------|
| **M1U** | `profiles.m1_units` | Lettura: useM1UnitsRealtime, BuzzActionButton, PracticeMode, verify-iap-purchase, cashback-claim, ecc. Scrittura: RPC/Edge only. | Alta |
| **Cashback** | `user_cashback_wallet` | Colonne: accumulated_m1u, lifetime_earned_m1u, last_claim_at (e altre). Lettura: `src/hooks/useCashbackWallet.ts` L113: SELECT accumulated_m1u, lifetime_earned_m1u, last_claim_at. | Alta |
| **canClaim / nextClaimAvailable** | Derivati client | useCashbackWallet: canClaim = accumulatedM1U > 0 && (logica su last_claim_at); nextClaimAvailable da getNextClaimDate(). | Alta |
| **RPC** | accrue_cashback, cashback-claim | Invocati da useCashbackWallet (accrue) e cashback-claim Edge (claim → credit to profiles.m1_units). | Alta |

**types.ts:** `user_cashback_wallet` **non** presente in `src/integrations/supabase/types.ts`. **BLOCKER** per type-safety; query funziona a runtime.

---

### 2.6 Leaderboard rank reale

| Item | Dove | Lettura / Scrittura | Affidabilità |
|------|------|---------------------|--------------|
| **MV** | `leaderboard_rankings` | Migration `20251130_realtime_leaderboard.sql`: global_rank, country_rank, region_rank, city_rank, total_score, ecc. Refresh: `refresh_leaderboard()`. | Alta (server) |
| **RPC** | `get_leaderboard(p_scope, p_filter_value, p_limit)` | Usato da useRealtimeLeaderboard (L67). Restituisce lista con rank per posizione. | Alta |
| **Hook “my rank”** | useRealtimeLeaderboard | currentUserRank = utente trovato nella lista (L174–176). Se user non in top `limit` (50), currentUserRank resta null. | **Parziale:** rank reale solo se dentro top 50. |
| **useLeaderboardPosition** | `src/hooks/useLeaderboardPosition.ts` | **Simulato:** `currentRank = Math.floor(Math.random() * 120) + 1` (L36). **NON usare per MPE.** | Bassa (fake) |

**Migliore fonte “my rank” reale:**  
- **(B)** Query MV: `SELECT global_rank FROM leaderboard_rankings WHERE id = auth.uid()` (richiede GRANT SELECT per authenticated su MV; migration già ha GRANT SELECT).  
- **(C)** RPC dedicato tipo `get_my_leaderboard_rank(p_user_id)` che faccia SELECT su MV.  
Oggi **(A)** calcolo client (posizione in lista) funziona solo per utenti in top 50.

---

### 2.7 Pulse Energy (PE)

| Item | Dove | Lettura / Scrittura | Affidabilità |
|------|------|---------------------|--------------|
| **Campo** | `profiles.pulse_energy` | Lettura: useAwardPE (dopo RPC), PracticeMode, BattleCreationForm, useRealtimeLeaderboard, AdvancedLeaderboard, ecc. | Alta |
| **RPC** | `award_pulse_energy(p_user_id, p_delta_pe, p_reason, p_metadata)` | useAwardPE (src/features/pulse/hooks/useAwardPE.ts) L171. | Alta |
| **Tabella** | `pe_daily_awards` | Migration `20250113_010_pe_daily_awards.sql`: user_id, action_type, pe_awarded, award_date, metadata. Per limiti giornalieri PE. RLS: SELECT own. | Alta |
| **Lettura “pulse_energy” da profiles** | Diretta | profiles.pulse_energy usata ovunque; nessun tipo mancante per profiles su questo campo (in types.ts profiles ha pulse_energy). | Alta |

---

### 2.8 Daily Commit completed

| Item | Dove | Lettura / Scrittura | Affidabilità |
|------|------|---------------------|--------------|
| **UI** | CommitRitual.tsx | 3 fasi (blobs), onComplete(durationMs) / onFail. **Nessuna** scrittura DB o campo “daily_commit_completed_at”. | N/A |
| **Tabella/campo** | **Non esistono** | Ricerca: nessun `daily_commit`, `commit_completed`, `ritual` in SQL/ts. | **GAP** |

**Conclusione:** Per “dailyCommitCompletedToday” serve nuovo campo (es. `profiles.daily_commit_completed_at` o tabella `user_ritual_log`) + evento da CommitRitual.

---

### 2.9 AION/Norah context

| Item | Dove | Lettura / Scrittura | Affidabilità |
|------|------|---------------------|--------------|
| **Edge** | `get-norah-context` | Invocato da `src/intel/norah/engine/contextBuilder.ts` L103 (supabase.functions.invoke). **Nome funzione:** `get-norah-context` (non presente in elenco file supabase/functions con nome letterale; potrebbe essere in altro path o naming). | Media |
| **Payload** | NorahContext | stats: `{ clues, buzz_today, finalshot_today }`; clues array; finalshot_recent; recent_msgs. | Da Edge |
| **Riuso MPE** | Possibile | Se get-norah-context ritorna già clues count e buzz_today/finalshot_today, si può riusare o affiancare per MPE; va verificato l’implementazione Edge (non trovata in repo con grep). | Da verificare |

---

## 3. DATABASE & MIGRATIONS vs types.ts

### 3.1 Tabelle/campo in migrations ma assenti o incompleti in types.ts

| Tabella / concetto | In migrations / DB | In types.ts | Note |
|--------------------|--------------------|------------|------|
| `user_activity_stats` | Sì (smart_push_system, smart_push_templates_SIMPLE) | **No** (nessuna entry) | BLOCKER: nessun tipo per SELECT. |
| `user_cashback_wallet` | Sì (backup, cashback-claim) | **No** | BLOCKER: lettura solo “raw”. |
| `leaderboard_rankings` | MV in 20251130_realtime_leaderboard.sql | **No** | BLOCKER per query tipizzate su MV. |
| `pe_daily_awards` | Sì (20250113_010_pe_daily_awards.sql) | **No** | BLOCKER per query tipizzate. |
| `user_clues` | Colonne: week (migration 20251213), week_number (backup), clue_category, prize_id, location_id | Row senza week, week_number, clue_category, prize_id, location_id | **Drift:** types incompleti. |
| `profiles` | current_streak_days, longest_streak_days, last_check_in_date (migrations streak) | Row letto 1129–1213: **mancano** current_streak_days, longest_streak_days, last_check_in_date | **Drift:** streak non in types. |

### 3.2 RLS (sintesi)

- **user_activity_stats:** SELECT per auth.uid() = user_id.  
- **user_clues:** SELECT/INSERT/UPDATE own; service_role full.  
- **user_map_areas:** SELECT/INSERT own; service full.  
- **user_cashback_wallet:** da verificare in migrations (non mostrato in questo audit); cashback-claim usa service o authenticated.  
- **leaderboard_rankings:** GRANT SELECT TO authenticated (migration).  
- **pe_daily_awards:** pe_daily_select_own (auth.uid() = user_id).  

---

## 4. USER TELEMETRY SNAPSHOT (SPEC READ-ONLY)

Proposta di schema concettuale per l’input al Mission Profile Engine (solo definizione, non implementazione).

```ts
interface UserTelemetrySnapshot {
  // INTELLIGENCE
  cluesCount: number;           // origin: user_clues (count) / useMissionStatus
  cluesThisWeek?: number;       // origin: user_clues WHERE week = current_week (GAP: week in types)
  clueTimestamps?: string[];   // origin: user_clues.unlocked_at / created_at
  clueRelevanceUsage?: unknown; // GAP

  // GEO CONVERGENCE
  buzzMapAreasCountTotal?: number;   // origin: user_map_areas count
  buzzMapAreasCountThisWeek?: number;
  radiusKmCurrent?: number;         // origin: user_map_areas (latest).radius_km
  overlap?: unknown;                // GAP
  frequencyMapInteraction?: unknown; // GAP

  // AGENT DISCIPLINE
  currentStreakDays: number;        // origin: profiles / get_user_streak_info
  lastCheckInDate: string | null;   // origin: profiles
  longestStreakDays?: number;       // origin: profiles
  daysActiveThisWeek?: number;      // origin: user_activity_stats (GAP: no read path)
  timeOnAppSeconds?: number;        // origin: user_activity_stats (sum time_on_*)
  timeOnMapSeconds?: number;        // origin: user_activity_stats.time_on_map

  // OPERATIONAL POWER
  m1uBalance: number;               // origin: profiles.m1_units
  cashbackAccumulatedM1u: number;  // origin: user_cashback_wallet.accumulated_m1u
  cashbackCanClaim: boolean;       // derived client
  cashbackNextClaimAvailable: string | null;
  leaderboardRankReal: number | null;  // origin: leaderboard_rankings.global_rank or RPC (GAP: my rank > 50)
  pulseEnergy: number;             // origin: profiles.pulse_energy
  dailyCommitCompletedToday?: boolean; // GAP: no persistence
  buzzCountToday?: number;         // GAP: definire tabella/aggregato

  // META
  lastUpdatedAt: string;           // freshness
  origin: Record<string, string>;  // quale tabella/RPC per ogni campo
  reliability: Record<string, 'high' | 'medium' | 'low'>;
}
```

---

## 5. GAP LIST (COSA MANCA)

| Gap | Perché serve | Opzione consigliata (min risk) |
|-----|----------------|--------------------------------|
| **Lettura user_activity_stats** | Tempo in app/map, days_active_this_week per “discipline”. | A: SELECT dalla tabella con RLS (già consentito). B: RPC get_user_activity_snapshot(user_id). |
| **RPC get_user_activity_snapshot** (opzionale) | Un solo round-trip per activity. | A: RPC che ritorna row user_activity_stats per user_id. |
| **My rank reale (oltre top 50)** | MPE deve mostrare rank reale anche per utenti fuori top 50. | A: SELECT global_rank FROM leaderboard_rankings WHERE id = auth.uid(). B: RPC get_my_leaderboard_rank. |
| **Hook “my rank” reale** | Sostituire useLeaderboardPosition (random). | Usare useRealtimeLeaderboard.currentUserRank dove disponibile; altrimenti query MV o RPC sopra. |
| **daily_commit_completed_at (o equivalente)** | “Daily Commit completed today” per bar Operational. | A: Campo profiles.daily_commit_completed_at (date) aggiornato da CommitRitual onComplete. B: Tabella user_ritual_log (user_id, completed_at). |
| **buzzCountToday** | Report “operational” / buzz oggi. | A: Contare da buzz_map_actions / user_activity_stats.total_buzzes con filtro data. B: Tabella/campo dedicato “buzz_count_today” aggiornato da handle-buzz-press. |
| **Run limits server-authoritative** | 1 free/day + extra a pagamento (5 M1U). | A: RPC check_mpe_run_eligibility(user_id) che legge tabella mpe_run_log (run_date, user_id, is_paid). B: Edge che verifica e scrive run. |
| **Telemetry aggregator RPC** | Un solo endpoint “get_agent_performance_inputs”. | A: RPC che costruisce snapshot (activity, streak, clues, map, wallet, rank, PE) e ritorna JSON. Riduce round-trip e centralizza autorizzazione. |
| **user_clues.week in types** | Type-safety e filter “this week”. | Allineare types.ts a schema (rigenerare da DB o aggiungere manualmente week / week_number). |
| **types per user_activity_stats, user_cashback_wallet, leaderboard_rankings, pe_daily_awards** | Type-safety e manutenibilità. | Rigenerare Supabase types o aggiungere definizioni manuali. |

---

## 6. COMPLESSITÀ E RISCHIO (%)

| Blocco | Complessità % | Rischio % | Dipendenze | Note |
|--------|----------------|-----------|------------|------|
| Data collection snapshot (query/RPC) | 35 | 25 | types allineati, RLS | Molte fonti già esistono; mancano letture client (activity) e rank oltre 50. |
| Schema drift / types mismatch | 20 | 40 | Migrations vs types | BLOCKER per sviluppo sicuro; risolvibile con rigenerazione types. |
| RLS / server-authoritative design | 25 | 30 | Run limits, RPC MPE | Definire chi può leggere/scrivere mpe_run_log e chi decreta “free vs paid”. |
| Leaderboard rank real-time + perf | 15 | 20 | MV refresh, index | Query su MV per singolo user leggera; refresh MV già gestito. |
| Daily delta persistence | 20 | 25 | Snapshot giornaliero | Se si vuole “delta vs ieri” serve salvare snapshot o calcolare da dati esistenti. |
| Paid run (5 M1U) server-side | 25 | 35 | profiles.m1_units, RPC | Decremento M1U e log run devono essere atomici (stessa transazione). |
| Offline / cache behavior | 30 | 30 | Sync, conflict | MPE può tollerare “ultimo snapshot in cache” con indicatore freshness. |
| iOS WKWebView constraints | 10 | 15 | Nessuna | Solo letture HTTP; nessun vincolo particolare oltre a rete. |

**Stime complessità complessiva:** ~25–30%. **Rischio complessivo:** ~28–32% (dominato da types drift e run limits).

---

## 7. ARCHITETTURA CONSIGLIATA (REAL DATA, MIN RISCHIO)

1. **Server-authoritative:**  
   - Run limits (1 free/day, extra 5 M1U) decisi da RPC/Edge che legge e scrive `mpe_run_log` e, se paid, decrementa `profiles.m1_units` in transazione.

2. **Snapshot in un colpo solo:**  
   - RPC tipo `get_agent_performance_inputs(p_user_id)` che ritorna un JSON con tutti i campi necessari (activity, streak, clues, map count, wallet, rank, PE, daily_commit_today se esiste). Il client non fa N query ma 1.

3. **Cache client:**  
   - Salvare l’ultimo snapshot in memoria (o sessionStorage) con `lastUpdatedAt`; mostrare “indicativo” se vecchio oltre X minuti; refresh on focus o al “Run scan”.

4. **Rate-limit:**  
   - Limite chiamate RPC snapshot (es. 1 ogni 60s per user) per evitare abusi.

5. **Interference/noise:**  
   - Seed “interference” può restare client (come oggi in getFakeReport) per variabilità visiva; per produzione seria meglio seed server o parametro nel RPC.

---

## 8. APPLE SAFETY (TERMINOLOGIA E MONETIZZAZIONE)

- **“Operational analysis” / “1 free analysis per day”:** terminologia generica; “analysis” è accettabile come descrizione funzionale (non garantisce risultato medico/finanziario). Evitare “diagnostic” o “health” se non è sanitario.
- **“Extra analysis — 5 M1U”:** chiaro che è prodotto in-app (M1U); prezzo in valuta virtuale. Conforme a IAP se M1U sono acquistabili e la “extra analysis” è consumo opzionale.
- **Nessuna modifica richiesta** in questo audit; solo conferma che testi attuali (en/fr/it) sono in linea con uso “analysis” e “5 M1U” come prodotto digitale.

---

## 9. NEXT STEPS (SOLO ELENCO, NO PATCH)

1. Allineare `src/integrations/supabase/types.ts` con DB: aggiungere/rigenerare tipi per `user_activity_stats`, `user_cashback_wallet`, `leaderboard_rankings`, `pe_daily_awards`; aggiungere a `user_clues` e `profiles` le colonne mancanti (week/week_number, streak, ecc.).
2. Implementare lettura client di `user_activity_stats` (SELECT per user_id) o RPC `get_user_activity_snapshot`.
3. Implementare “my rank” reale: query su `leaderboard_rankings` per auth.uid() o RPC `get_my_leaderboard_rank`.
4. Introdurre persistenza “daily commit completed”: campo su profiles o tabella `user_ritual_log` + aggiornamento da CommitRitual onComplete.
5. Definire e implementare `buzzCountToday` (derivato o tabella/campo dedicato).
6. Creare tabella `mpe_run_log` (user_id, run_date, is_paid, created_at) e RPC che verifica limite (1 free/day) e optionalmente consuma 5 M1U per run extra.
7. (Opzionale) Implementare RPC aggregato `get_agent_performance_inputs` che ritorna UserTelemetrySnapshot.
8. Sostituire `getFakeReport()` con costruzione report da UserTelemetrySnapshot (con fallback a report “simulato” se snapshot incompleto o offline).

---

**Fine report. Nessuna modifica applicata al repository.**
