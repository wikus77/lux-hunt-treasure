# INCIDENT REPORT — MPE Real Data v1 — FASE 1 VERIFICA (READ-ONLY)

**Data:** 2026-02-22  
**Scope:** Verifica repo + assunzioni DB per implementazione MPE “real data” (server-auth, delta ieri, daily commit).  
**Vincolo:** ZERO MODIFICHE — solo lettura. Nessun file modificato, nessuna SQL applicata.

---

## 1. REPO MAPPING — File MPE e Commit Ritual

### 1.1 Componenti MPE (confermati)

| Path | Ruolo |
|------|--------|
| `src/components/missionProfileEngine/MissionProfileEngineSheet.tsx` | Sheet fullscreen, stati idle → scan → report; chiama `getFakeReport()` in `handleScanComplete` (linee 71–76); `handleExtraAnalysis` toast “coming soon” (103–105) |
| `src/components/missionProfileEngine/MissionProfileEngineScan.tsx` | Scan HUD 10–40s, steps, abort; props `onComplete`, `onAbort`; nessuna chiamata dati reali |
| `src/components/missionProfileEngine/MissionProfileEnginePill.tsx` | Pill UI |
| `src/components/missionProfileEngine/MissionProfileEngineRing.tsx` | Ring UI |
| `src/components/missionProfileEngine/mpe-pill-title.css` | Stili pill |
| `src/lib/missionProfileEngine/fakeReport.ts` | `getFakeReport()` — report deterministico da seed giornaliero; da sostituire con dati da RPC |
| `src/lib/missionProfileEngine/scanTimings.ts` | `buildScanSteps(dataComplexity)` |
| `src/lib/missionProfileEngine/types.ts` | `AgentPerformanceReport`, `ScanStep`, `ScanStepId` |

### 1.2 Commit Ritual — hook daily commit

| Item | Evidenza |
|------|----------|
| **File** | `src/components/commit/CommitRitual.tsx` |
| **Props** | `onComplete: (durationMs: number) => void` (linea 17), `onFail` |
| **Chiamata onComplete** | Linea 202: `onComplete(Math.round(elapsed))` quando fase `complete` |
| **Chi usa CommitRitual** | `src/components/commit/CommitModal.tsx` (linee 244–248): `<CommitRitual onComplete={handleComplete} onFail={handleFail} />` |
| **handleComplete (CommitModal)** | Linee 98–139: dopo ritual complete chiama `supabase.rpc('apply_commit_ritual', { p_duration_ms: durationMs })`; su success mostra reward e chiude. **Nessuna persistenza “daily commit completed” per MPE oggi.** |
| **Punto di hook min-risk** | In `CommitModal.tsx` dentro `handleComplete`, subito dopo `response.success === true` (es. dopo linea 114), **una sola chiamata**: `await supabase.rpc('mpe_record_daily_commit')` con guardia `user` e try/catch silente. Nessun cambio UX. |

---

## 2. HOOKS DATI ESISTENTI (fonti per snapshot)

| Hook | Path | Cosa espone / dove legge |
|------|------|---------------------------|
| **useMissionStatus** | `src/hooks/useMissionStatus.ts` | `missionStatus.cluesFound` (linee 77–122): max tra count `user_clues`, count `user_notifications` type=buzz, sum `buzz_map_actions.clue_count`. Per MPE v1: usare count `user_clues` in RPC è sufficiente. |
| **useBuzzMapLogic** | `src/hooks/useBuzzMapLogic.ts` | Legge `user_map_areas` con `user_id`, `source='buzz_map'`, `week = getCurrentWeekOfYear()`; ordine `created_at desc`, limit 1. Espone `currentWeekAreas` (array con `radius_km`, `week`). `getCurrentWeekOfYear()` da `src/lib/weekUtils.ts` (ISO week). |
| **useCashbackWallet** | `src/hooks/useCashbackWallet.ts` | Wallet da DB (user_cashback_wallet + RPC/edge). Usato in IntelChatPanel, BuzzActionButton, BuzzMapButtonSecure, CashbackVaultPill. |
| **useRealtimeLeaderboard** | `src/hooks/useRealtimeLeaderboard.ts` | Linee 68–71: `supabase.rpc('get_leaderboard', { p_scope, p_filter_value, p_limit })`; espone `currentUserRank`, `leaderboard`. Rank viene da MV `leaderboard_rankings` via RPC. |
| **profiles.m1_units / pulse_energy** | Vari | `useM1UnitsRealtime.ts`: `.select('id, m1_units, updated_at')` da `profiles`. `PracticeMode.tsx`, `BuzzActionButton.tsx`, `useClueMilestones.ts`, `useHierarchyRank.ts`, battle components: lettura/update `profiles.pulse_energy` e `profiles.m1_units`. |

Conclusione: tutte le fonti necessarie per lo snapshot MPE sono leggibili via SQL/RPC (user_clues, user_map_areas, user_activity_stats, user_cashback_wallet, profiles, leaderboard_rankings, get_user_streak_info) **senza toccare** BUZZ button, BUZZ Map flow, IAP, AION.

---

## 3. RPC / EDGE — update_user_activity, get-norah-context

| Item | Evidenza | PASS/FAIL (per MPE) |
|------|----------|----------------------|
| **update_user_activity** | Chiamato dal **client** in `src/hooks/useActivityTracker.ts` (linee 42, 92). Definizione in `supabase/migrations/20251203_smart_push_system.sql` (SECURITY DEFINER). **GRANT EXECUTE** per `authenticated` **non** presente in nessuna migration. | **FAIL** (gap permessi). **Non bloccante per MPE**: MPE non deve chiamare update_user_activity; deve solo **leggere** user_activity_stats via RPC snapshot. Remediation minima: aggiungere in una migration `GRANT EXECUTE ON FUNCTION update_user_activity(...) TO authenticated;` (solo nota, non applicata). |
| **get-norah-context** | Edge `supabase/functions/get-norah-context/index.ts` presente; client invoca `get-norah-context` da `src/intel/norah/engine/contextBuilder.ts`. Output: agent, mission, stats (clues, buzz_today, finalshot_today), clues, finalshot_recent, messages. | **PASS**. Opzionale per MPE: lo snapshot MPE non usa get-norah-context; usa direttamente profiles, user_clues, user_activity_stats, leaderboard_rankings, get_user_streak_info. |

---

## 4. DB ASSUMPTIONS (solo da repo/migrations — DB reale non interrogato)

Verifica **solo da migrations** (nessuna query eseguita su DB).

| Requisito | Migration / evidenza | PASS/FAIL |
|-----------|----------------------|-----------|
| Tabella **user_activity_stats** | `20251203_smart_push_system.sql`: CREATE TABLE, RLS ON, policy "Users can read own activity" (SELECT, auth.uid() = user_id) | **PASS** |
| Tabella **user_cashback_wallet** | `20251207_cashback_vault.sql`: CREATE TABLE, RLS, "Users can view own cashback wallet" | **PASS** |
| Tabella **user_map_areas** | `20251119111941_*.sql`: CREATE TABLE (user_id, lat, lng, radius_km, week, source, …), RLS SELECT/INSERT own | **PASS** |
| Tabella **buzz_map_actions** | `20251120035636_*.sql`: CREATE TABLE, RLS view/insert own | **PASS** |
| Tabella **user_clues** | Citata in leaderboard MV, in `20251213_fix_user_clues_and_enrollment.sql`: colonne clue_category, week | **PASS** |
| Tabella **pe_daily_awards** | `20250113_010_pe_daily_awards.sql`: CREATE TABLE, RLS pe_daily_select_own | **PASS** |
| MV **leaderboard_rankings** | `20251130_realtime_leaderboard.sql`: CREATE MATERIALIZED VIEW, `GRANT SELECT ON public.leaderboard_rankings TO authenticated` | **PASS** |
| Query `SELECT global_rank FROM leaderboard_rankings WHERE id = auth.uid()` | MV ha colonna `id`, `global_rank`; GRANT SELECT a authenticated → consentita (RLS non si applica alle MV) | **PASS** |
| RLS SELECT own **user_activity_stats** | Policy "Users can read own activity" USING (auth.uid() = user_id) | **PASS** |
| **profiles**: streak, pulse_energy, m1_units | `20251004081340_95e746be_*.sql`: current_streak_days, longest_streak_days, last_check_in_date; pulse_energy/m1_units in altre migration e in MV leaderboard | **PASS** |
| **user_clues** week vs week_number | `20251213`: colonna `week` su user_clues; `weekly_leaderboard` ha `week_number`. Drift gestibile: RPC MPE userà user_clues e user_map_areas.week (integer ISO week) | **PASS** (drift identificato, gestibile) |
| **get_user_streak_info** | `20251130_streak_badges_system.sql`: CREATE FUNCTION get_user_streak_info(p_user_id), GRANT EXECUTE TO authenticated | **PASS** |

**Nota:** Quali migration siano state **applicate** sul DB reale non è verificabile dal repo. Se una di queste non fosse applicata, il comportamento reale potrebbe differire.

---

## 5. MIN-RISK INTEGRATION POINTS

| Punto | Stato attuale | Integrazione proposta |
|-------|----------------|----------------------|
| **Daily commit completato** | Oggi **non** esiste persistenza “daily commit” per MPE. CommitModal chiama solo `apply_commit_ritual` (M1U, logica commit esistente). | Nuova tabella `mpe_daily_commit_log` + RPC `mpe_record_daily_commit()`. Hook: in **CommitModal.tsx** in `handleComplete`, dopo `response.success === true`, una chiamata `supabase.rpc('mpe_record_daily_commit')` (guardia user, try/catch silente). |
| **Delta vs ieri** | Non esiste snapshot giornaliero. | Nuova tabella `mpe_daily_snapshots`; RPC `mpe_save_daily_snapshot` (a fine scan), `mpe_get_daily_delta()` (legge snapshot oggi/ieri). |
| **Run 1 free/day + extra a pagamento** | Non esiste. | Tabella `mpe_run_log` + RPC `mpe_check_and_consume_run(p_is_paid)`: free 1/day, paid decremento 5 M1U da profiles (transazione atomica). Nessun legame IAP. |

---

## 6. TABELLA PASS/FAIL FINALE (criteri per procedere a Fase 2)

| # | Requisito | Esito |
|---|-----------|--------|
| 1 | leaderboard_rankings: SELECT granted a authenticated (e query per global_rank per auth.uid()) | **PASS** (migration) |
| 2 | get-norah-context esiste e invocabile (opzionale per MPE) | **PASS** |
| 3 | Possiamo leggere tutte le fonti snapshot via SQL/RPC senza toccare BUZZ/IAP/AION | **PASS** |
| 4 | Daily commit hook individuato con 1 singola chiamata (CommitModal handleComplete) | **PASS** |
| 5 | Drift week/week_number identificato e gestibile senza cambiare logiche BUZZ | **PASS** |
| 6 | update_user_activity: GRANT EXECUTE per authenticated (per useActivityTracker) | **FAIL** (solo per activity tracker; **non bloccante per MPE**) |

**Decisione:** Nessun FAIL **critico** per MPE real data v1. I criteri “PASS per procedere a Fase 2” sono soddisfatti. Il FAIL su update_user_activity riguarda un altro flusso; può essere corretto in una migration separata.

---

## 7. FILE DA TOCCARE IN FASE 2 (solo indispensabili)

| Tipo | File / risorsa |
|------|-----------------|
| **Migration (nuovi)** | `supabase/migrations/YYYYMMDD_HHMM_mpe_real_data_v1.sql` (o 2–3 file separati): tabelle `mpe_daily_snapshots`, `mpe_run_log`, `mpe_daily_commit_log` + RPC `mpe_get_inputs_snapshot`, `mpe_check_and_consume_run`, `mpe_record_daily_commit`, `mpe_save_daily_snapshot`, `mpe_get_daily_delta`. |
| **Client MPE** | `src/components/missionProfileEngine/MissionProfileEngineSheet.tsx`: gating run (mpe_check_and_consume_run), fetch snapshot (mpe_get_inputs_snapshot), report da snapshot, save snapshot + delta (mpe_save_daily_snapshot, mpe_get_daily_delta); `handleExtraAnalysis` → mpe_check_and_consume_run(true). |
| **Client (hook daily commit)** | `src/components/commit/CommitModal.tsx`: in `handleComplete` dopo success, chiamata `supabase.rpc('mpe_record_daily_commit')` con guardie. |
| **Lib (opzionale)** | `src/lib/missionProfileEngine/`: eventuale helper che da snapshot costruisce `AgentPerformanceReport` (stesso tipo, dati reali); oppure logica inline nello Sheet. **Nessun cambio** a `fakeReport.ts` se si mantiene fallback; altrimenti sostituzione con builder da snapshot. |

**Non toccare:** ios/**, BUZZ button/flow, BUZZ Map flow, IAP, AION, push native, routing/auth, layout/design globale, CommitRitual.tsx (solo CommitModal per 1 RPC).

---

## 8. DECISIONE ARCHITETTURALE “MIN RISK”

| Scelta | Decisione |
|--------|------------|
| **RPC-only vs Edge+RPC** | **RPC-only**: tutte le operazioni MPE (snapshot, gating run, daily commit, save snapshot, delta) via RPC Postgres. Nessuna nuova Edge Function. |
| **Numero query client** | **3 RPC principali**: (1) `mpe_check_and_consume_run(false)` prima di avviare scan; (2) `mpe_get_inputs_snapshot()` all’inizio (o a metà) scan; (3) a fine scan: `mpe_save_daily_snapshot` + `mpe_get_daily_delta`. Se extra run: `mpe_check_and_consume_run(true)`. Daily commit: 1 RPC in CommitModal. |
| **Inserimenti snapshot/run/commit** | Solo via RPC (SECURITY DEFINER), non INSERT diretto da client. RLS: SELECT own sulle tre tabelle MPE; INSERT solo tramite RPC. |

---

## 9. STIMA DIFFICOLTÀ E RISCHI

| Blocco | Difficoltà (0–100%) | Rischi principali |
|--------|----------------------|-------------------|
| Migration + RPC (tabelle + 5 funzioni) | 25% | Schema errato (es. unique su run free/day); test su DB reale dopo apply. |
| mpe_get_inputs_snapshot (raccolta dati eterogenei) | 35% | Allineamento week ISO client/DB; fallback se tabella vuota (es. user_activity_stats). |
| mpe_check_and_consume_run (atomico M1U) | 20% | Decremento M1U in transazione; nessun collegamento IAP. |
| Client Sheet (sostituzione fakeReport + gating) | 30% | Mantenere stesso tipo `AgentPerformanceReport`; mappatura snapshot → bars/percentage/dailyDelta; UI invariata. |
| Hook CommitModal (mpe_record_daily_commit) | 5% | Una chiamata, guardie, try/catch; rischio minimo. |

**Rischi globali:** (1) Migration non applicate in alcuni ambienti; (2) performance RPC snapshot (mitigabile con indici e una sola query composita); (3) primo giorno senza “ieri” → delta “N/A” o “insufficient history” (già previsto).

---

## 10. REMEDIATION MINIMA (NON APPLICATA) — update_user_activity

Per far funzionare correttamente `useActivityTracker` (che chiama `update_user_activity`):

- Aggiungere in una migration dedicata:
  - `GRANT EXECUTE ON FUNCTION public.update_user_activity(UUID, VARCHAR, INTEGER, DECIMAL, DECIMAL) TO authenticated;`
- Opzionale: `TO anon` se necessario per utenti non autenticati (di solito no).

---

## 11. CONCLUSIONE FASE 1

- **Verifica read-only completata.** Nessuna modifica al repo.
- **Tutti i criteri PASS per MPE** (leaderboard, fonti dati, hook daily commit, drift week gestibile).
- **Un solo FAIL non bloccante:** GRANT per `update_user_activity` (remediation sopra).
- **Procedere a Fase 2:** **SÌ**, con rollback tag prima degli step e micro-commit come da specifica.

---

*Report generato in modalità read-only. Fase 2 da eseguire solo dopo conferma esplicita: “PASS → procedo con Fase 2”.*
