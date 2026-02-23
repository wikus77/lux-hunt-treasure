# AGENT PERFORMANCE CALCULATOR™ (AAA) + M1SSION SIGNAL ENGINE™ — READ-ONLY AUDIT & IMPLEMENTATION BLUEPRINT

**Data:** 2026-02-22  
**Target:** iOS Capacitor WKWebView (app nativa wrappata). NON PWA.  
**Vincolo:** READ-ONLY — nessuna modifica a codice, config, plist, build, dipendenze.  
**Firma:** Lovable Agent JLENIA

---

## A) WHAT WE ALREADY HAVE

### 1. Tracking session time / time in map

| Elemento | File / Path | Note |
|----------|-------------|------|
| Hook activity | `src/hooks/useActivityTracker.ts` | Mappa route → page name (`ROUTE_TO_PAGE`: home, map, buzz, intelligence, leaderboard, notifications). Flush tempo pagina precedente su cambio route; invia `update_user_activity` con `p_page`, `p_seconds`; opzionale `p_lat`/`p_lng` (geolocation ogni 5 min). |
| RPC backend | `supabase.rpc('update_user_activity', { p_user_id, p_page, p_seconds, p_lat?, p_lng? })` | Chiamato da `useActivityTracker` (righe 42, 90–92). |
| Tabella | `user_activity_stats` (migration `supabase/migrations/20251203_smart_push_system.sql`) | Colonne: `time_on_home`, `time_on_map`, `time_on_buzz`, `time_on_intelligence`, `time_on_leaderboard`, `time_on_notifications` (secondi); `total_buzzes`, `total_map_views`, `total_aion_chats`, `total_leaderboard_views`; `last_*_at`; `last_known_lat/lng`, `last_location_update`; `days_active_this_week`, `current_streak`, `longest_streak`. **Nota:** tabella non presente in `src/integrations/supabase/types.ts` (possibile migrazione non riflessa nei types). |
| Route→page | `src/hooks/useActivityTracker.ts` righe 11–20 | `/home`→home, `/map-3d-tiler` e `/buzz-map`→map, `/buzz`→buzz, `/intelligence`→intelligence, `/leaderboard`→leaderboard, `/notifications`→notifications. |

**Conclusione:** Tempo per pagina (incluso map) è tracciato e aggregato lato server in `user_activity_stats`. Dati non esposti in tempo reale in app tramite hook dedicato (solo scrittura via RPC).

---

### 2. Streak giornaliero / login tracking

| Elemento | File / Path | Note |
|----------|-------------|------|
| Profilo | `profiles.current_streak_days`, `profiles.longest_streak_days`, `profiles.last_check_in_date` | In Supabase types (profiles). |
| Check-in | `supabase/functions/handle-daily-checkin/index.ts` | Aggiorna streak e `last_check_in_date`; award XP via `award_xp`; badge 7/30/100 giorni. |
| UI streak | `src/components/gamification/StreakWidget.tsx`, `StreakModal.tsx`, `StreakPill.tsx`, `DailyCheckInButton.tsx` | Caricano da `profiles` o RPC `get_user_streak_info`. |
| Hook | `src/hooks/useStreakReminder.ts` | Reminder streak. |

**Conclusione:** Streak e last check-in esistono e sono usati in UI; disponibili da `profiles` (e da RPC se presente).

---

### 3. BUZZ clues storage (numero, week, timestamps, usage)

| Elemento | File / Path | Note |
|----------|-------------|------|
| Tabella | `user_clues` (types righe 1593–1630) | `user_id`, `clue_id`, `clue_type`, `title_it`, `description_it`, `buzz_cost`, `created_at`, `unlocked_at`, `metadata`. **Nessuna colonna `week_number`** nei types; in `useBuzzFeature` si inserisce `week_number` (calcolato da timestamp). |
| Inserimento | `src/hooks/useBuzzFeature.ts` righe 172–182 | Insert in `user_clues` con `clue_id`, `title_it`, `description_it`, `clue_type: "buzz"`, `buzz_cost: 199`, `week_number`. |
| Conteggio | `src/hooks/useMissionStatus.ts` righe 80–118 | Count da `user_clues` + count da `user_notifications` type=buzz + somma `clue_count` da `buzz_map_actions`; usa il max dei tre come “real clues count”. |
| Notifiche buzz | `user_notifications` con `type: 'buzz'` | Usate come seconda fonte di conteggio. |
| Backend clues | `supabase/functions/handle-buzz-press/index.ts` | Legge `user_clues` per clue già sbloccati; salva in `user_clues` (righe 693–774). |
| Utils locali | `src/utils/buzzClueUtils.ts`, `src/utils/buzzConstants.ts` (MAX_BUZZ_CLUES), `src/hooks/useBuzzClues.ts`, `src/hooks/buzz/useBuzzClues.ts` | Conteggio sbloccati e “used vague clues” anche in memoria/localStorage. |

**Conclusione:** Numero clues, tipo, timestamp (created_at/unlocked_at) e week (se colonna presente in DB) sono disponibili da `user_clues` + `user_notifications` + `buzz_map_actions`. Usage “vague” parzialmente in locale.

---

### 4. Buzz Map: diametro/area, aree generate, sovrapposizione, interazioni

| Elemento | File / Path | Note |
|----------|-------------|------|
| Tabella aree | `user_map_areas` (types 1767–1813) | `user_id`, `lat`, `lng`, `radius_km`, `source`, `week`, `active`, `center_lat`, `center_lng`, `level`, `price_eur`, `created_at`. |
| Raggio progressivo | `src/hooks/buzz/useBuzzMapUtils.ts` | `calculateProgressiveRadiusFromCount(weeklyBuzzCount)`: BASE 100 km, MIN 0.5 km, factor 0.95 per step; `calculateNextRadiusFromArea(activeArea)`. |
| Conteggio aree | `src/hooks/useBuzzMapLogic.ts` righe 88–133 | Query `user_map_areas` con `source='buzz_map'`, filtro week corrente; realtime subscription `user_map_areas_changes`. |
| Backend | `supabase/functions/handle-buzz-press/index.ts` (willMap branch) | RPC `m1_get_next_buzz_level`; count da `user_map_areas` per user + source buzz_map; bootstrap primi 10 con raggio 2×. |
| Backend resolve | `supabase/functions/buzz-map-resolve-v2/index.ts`, `handle-buzz-map/index.ts` | Generazione aree (centro casuale, premio dentro raggio); insert in `user_map_areas` e `buzz_map_actions`. |
| Tabella azioni | `buzz_map_actions` | Usata in `useMissionStatus` (clue_count), `useBuzzMapProgressivePricing.ts` (select/insert). |
| UI | `src/pages/map/components/BuzzCircleRenderer.tsx` | Render cerchi da `area.radius_km`, lat/lng. |

**Conclusione:** Diametro/raggio per area in `user_map_areas.radius_km`; numero aree e week da `user_map_areas`; sovrapposizione non calcolata esplicitamente; interazioni (click) solo log in console.

---

### 5. Wallet M1U + cashback / ledger

| Elemento | File / Path | Note |
|----------|-------------|------|
| Saldo M1U | `profiles.m1_units` | Types 1143, 1168, 1193. |
| Hook | `src/hooks/useCashbackWallet.ts` | Legge `user_cashback_wallet` (accumulatedM1U, lifetimeEarnedM1U), `canClaim`, `nextClaimAvailable`; metodi `accrueFromBuzz`, `accrueFromBuzzMap`, `claimCashback`; config `M1SSION_ENABLE_CASHBACK`, `cashbackConfig`. |
| Tabella cashback | `supabase/migrations/20251207_cashback_vault.sql` | `user_cashback_wallet` (accumulated_m1u, lifetime_earned_m1u, last_claim_at); `cashback_transactions` (source_type, source_cost_eur, cashback_m1u, tier_at_time). |
| RPC | `accrue_cashback`, `claim_cashback` | Chiamati da Edge/cashback-claim. |
| UI | `src/components/m1units/M1UnitsPill.tsx`, `src/components/home/CashbackVaultPill.tsx` | Mostrano M1U e cashback. |

**Conclusione:** M1U e cashback sono disponibili da profilo e tabelle cashback; ledger-like in `cashback_transactions` (storico).

---

### 6. Leaderboard position

| Elemento | File / Path | Note |
|----------|-------------|------|
| Score formula | `src/hooks/useRealtimeLeaderboard.ts` righe 133–158 | `score = (pulse_energy||0)*2 + clues*10 + buzz*5 + (current_streak_days||0)*3`; ordinamento e `rank = index+1`. |
| Dati | `profiles` + `user_clues` count + `user_buzz_counter` (buzz_count) | useRealtimeLeaderboard e AdvancedLeaderboard costruiscono leaderboard da queste fonti. |
| MV | `supabase/migrations/20251130_realtime_leaderboard.sql` | `leaderboard_rankings` (materialized view) con global_rank, country_rank, region_rank, city_rank. |
| Hook posizione utente | `src/hooks/useLeaderboardPosition.ts` | **Simulato (random)** — non usa dati reali (righe 35–89). |
| UI | `src/components/leaderboards/AdvancedLeaderboard.tsx`, `UserLeaderboard.tsx`, `LeaderboardPage.tsx` | Dati reali da fetch (profiles, user_clues, user_buzz_counter). |

**Conclusione:** Rank reale è calcolabile da `useRealtimeLeaderboard` / query come in AdvancedLeaderboard; non esiste un hook “my rank” con dati reali (useLeaderboardPosition è fake).

---

### 7. “Commit giornaliero” (definizione e dati esistenti)

| Elemento | File / Path | Note |
|----------|-------------|------|
| Copy | `src/locales/*/common.json`: `status_commit_label` (“Daily Commit” / “Commit Giornaliero”), `commit_daily_suffix`, `faq_confused_answer` (“Complete the daily commit (the 3 blobs)”) | Il “commit” è presentato come i “3 blob” da completare. |
| UI ritual | `src/components/commit/CommitRitual.tsx` | Rituale gestuale (hold 7s, 3 fasi); onComplete/onFail; nessun persist esplicito del “completato oggi” in questo file. |
| Next action | `src/components/feedback/NextActionContent.tsx` | CTA e descrizioni per buzz/commit; track `daily_mission_click_from_next_action`. |

**Conclusione:** “Commit giornaliero” è un concetto di prodotto (i 3 blob / ritual); non c’è una tabella o campo dedicato “daily_commit_completed_at” o simile. Si può derivare da: check-in (last_check_in_date), o da logica da definire (es. CommitRitual completa → scrivere da qualche parte).

---

### 8. AION agent: dove vive, come viene invocato, output UI

| Elemento | File / Path | Note |
|----------|-------------|------|
| Chat Intel (AION) | `src/pages/intel/IntelChatPanel.tsx` | UI messaggi; `sendMessage` → chiamata API chat; status listening/thinking. |
| API chat | Edge `norah-chat-v2` (e norah-chat, norah-answer) | norah-chat-v2: intent detection, fallback oracle, Gemini; risposta testuale. |
| Chiamata da app | Probabile `supabase.functions.invoke('norah-chat-v2', ...)` o simile da IntelChatPanel / hook chat | Payload: messages; risposta = testo AION. |
| Context Norah | `src/intel/norah/engine/contextBuilder.ts` | `buildNorahContext()` → invoke `get-norah-context`; ritorna `NorahContext`: agent, mission, stats (clues, buzz_today, finalshot_today), clues, finalshot_recent, recent_msgs. |
| Next Best Action | `src/intel/norah/engine/nextBestAction.ts` | `computeNBA(ctx, phase, sentiment, ...)`: usa ctx.stats (clues, buzz_today), streak_days, ora locale; ritorna titolo, steps, cta. |
| LLM locale | `src/intel/norah/useNorahLLM.ts`, `src/lib/ai-gateway/aiGateway.ts` | `processAIRequest`, `routeIntent`, risposta come stringa. |
| UI output | Messaggi in `IntelChatPanel`, `NorahChatLLM`, `NorahChat` | Bubble assistant/user; nessuno schema strutturato “report” (solo testo). |

**Conclusione:** AION vive in Edge (norah-chat-v2) e in context/engine lato client (contextBuilder, nextBestAction). Output attuale è testo libero in chat; non esiste un “AgentPerformanceReport” strutturato (%, stato, azione prioritaria, delta).

---

### 9. Calcolatori / scoring già implementati

| Elemento | File / Path | Note |
|----------|-------------|------|
| PE (Pulse Energy) | `src/features/pulse/hooks/useAwardPE.ts` | `PEActionType`, `PE_VALUES`, `PE_DAILY_LIMITS`; `awardPE(action, amount?)` → RPC `award_pulse_energy`; `record_pe_daily_action` per log giornaliero. |
| RPC PE | `award_pulse_energy`, `check_pe_daily_limit`, `record_pe_daily_action`, `get_pe_daily_stats` | Migrations 20250113_010_pe_daily_awards.sql, types 2415. |
| Leaderboard score | Vedi sopra | Formula PE*2 + clues*10 + buzz*5 + streak*3. |
| Next Best Action | `nextBestAction.ts` | Scoring euristico (ora, buzz_today, clues, streak) → titolo + steps + cta, non una %. |
| Mission status | `src/hooks/useMissionStatus.ts` | Days remaining, clues count, progress missione; nessuna “% avanzamento” unificata. |

**Conclusione:** Esistono PE, score leaderboard e NBA euristico; non esiste un “Agent Performance %” (5–95%) con smoothing e rumore controllato.

---

## B) WHAT WE NEED TO IMPLEMENT (GAP + PRIORITÀ)

### Metriche NON esistenti o non affidabili

1. **Percentuale avanzamento missione (5–95%)** — Non esiste; va progettata (deterministico + 10% rumore, smoothing, anti-forcing).
2. **Stato/forza/debolezza + 1 azione prioritaria con expected delta** — NBA attuale è testuale e non include delta in range; va esteso o affiancato da un output strutturato.
3. **Delta giornaliero (+/−)** — Non esiste un “progress delta day-over-day” persistito; richiede snapshot giornalieri o derivazione da dati esistenti.
4. **Rank reale “my position” in un hook** — `useLeaderboardPosition` è simulato; serve hook che usa la stessa logica di useRealtimeLeaderboard/AdvancedLeaderboard per la singola posizione utente.
5. **Tempo in app / tempo in mappa in tempo reale in app** — Scritto in `user_activity_stats` ma non letto in UI/hook; serve query o RPC di lettura e eventuale cache.

### Metriche esistenti ma incomplete / non affidabili

1. **BUZZ clues “week”** — Inserito in `user_clues` in useBuzzFeature ma la colonna `week_number` non è nei types; verificare schema reale e coerenza.
2. **Buzz Map overlap** — Non calcolata; solo count aree e radius; utile per “qualità esplorazione”.
3. **Commit giornaliero “completato”** — Nessun dato esplicito; va definito dove e come registrarlo (es. dopo CommitRitual onComplete).

### Metriche esistenti ma NON accessibili in tempo reale in app

1. **user_activity_stats** — Scritta da RPC; nessun hook che legge time_on_* per mostrare/calcolare in UI.
2. **leaderboard_rankings (MV)** — Materialized view; refresh e lettura “my rank” da app da definire (e possibilmente esporre via RPC).

---

## C) AAA ARCHITECTURE BLUEPRINT (SOLO PROGETTAZIONE)

### Posizionamento Engine

- **Calculator Engine:** `src/lib/agent-performance/` (o `src/services/agentPerformance/`):
  - `types.ts` — Input/Output schema.
  - `calculatorEngine.ts` — Funzione pura: `UserTelemetrySnapshot` → `AgentPerformanceReport`.
  - `smoothing.ts` — Inerzia (EWMA o simile), clamp 5–95%.
  - `noise.ts` — Rumore 10% con seed giornaliero stabile, clamp, explanation line.
  - `antiForcing.ts` — Soft-cap, delay, banded deltas, no spike.
- **Hook:** `src/hooks/useAgentPerformanceReport.ts` — Raccoglie snapshot (da context/hook esistenti + eventuale RPC “telemetry”), chiama engine, gestisce cache 1 free/day + extra a pagamento (5 M1U).
- **AION integration:** Nuovo “tool” o flusso in norah-chat-v2 (o client) che: riceve `AgentPerformanceReport`, formatta messaggio “oracolo” (%, stato, forza/debolezza, 1 azione prioritaria + expected delta, delta giornaliero).

### Schemi dati (proposti)

**UserTelemetrySnapshot** (input):

- `cluesCount`, `cluesThisWeek`, `buzzCountToday`, `buzzMapAreasCount`, `buzzMapTotalRadiusKm` (o area equivalente)
- `timeOnMapSeconds`, `timeOnAppSeconds` (da user_activity_stats o RPC)
- `streakDays`, `lastCheckInDate`
- `m1uBalance`, `cashbackAccumulated`
- `leaderboardRank`, `leaderboardScore`
- `pulseEnergy`
- `dailyCommitCompletedToday: boolean` (quando definito)
- `timestamp`, `userId`

**AgentPerformanceReport** (output):

- `percentage: number` (5–95)
- `state: 'low' | 'medium' | 'high'` (o etichette prodotto)
- `strengths: string[]`, `weaknesses: string[]`
- `priorityAction: { label: string; expectedDeltaRange: [number, number]; actionId: string }`
- `dailyDelta: number` (+/− rispetto al giorno prima)
- `confidenceBand: 'low' | 'medium' | 'high'`
- `interferenceLine?: string` (spiegazione rumore, Apple-safe)

### Caching / refresh

- 1 analisi gratuita al giorno: chiave `agent_perf_last_run_${userId}_${date}`; se stesso giorno e già fatto → “analisi già usata oggi”.
- Analisi extra: costo 5 M1U; dopo pagamento si può ricalcolare e aggiornare cache (stesso giorno).
- Snapshot telemetry: cache breve (es. 5 min) per evitare troppe query; refresh prima del run del calculator.

### Smoothing

- Formula consigliata: EWMA su `percentage` con alpha basso (es. 0.2–0.3): `newPct = alpha * rawPct + (1 - alpha) * previousPct`; poi clamp 5–95%.
- Parametri: alpha, min/max; “previous” persistito in localStorage o in backend (es. `user_agent_performance_snapshot.last_percentage`).
- Anti-abuse: rate limit su run (1 free + N paid al giorno); nessun dato “raw” esposto che sveli soluzioni.

### Rumore controllato (10%, Apple-safe)

- Modello “Interference”: il 10% del valore mostrato è variabile in modo deterministico da seed giornaliero (es. `hash(userId + date)` → seed).
- Clamp: la percentuale finale resta 5–95%; il rumore non può invertire trend (es. solo ±N punti).
- Explanation line: testo tipo “Il segnale può subire lievi interferenze di rete; il valore è indicativo.” (copy da validare in D).

### Anti-forcing

- Soft-cap: nessuna metrica che “forza” la % verso 100% (es. cap su contributo singolo).
- Delay: aggiornamento della % non immediato dopo azione (es. dopo 1 run giornaliero o dopo N minuti).
- Banded deltas: delta giornaliero in bande (es. -2, -1, 0, +1, +2) per evitare numeri che sembrano “guarantee”.
- No spike: smoothing evita salti bruschi.

### Confidence band

- `low`: pochi dati (es. primo giorno, poche azioni).
- `medium`: dati sufficienti per trend (es. 3+ giorni, qualche clue/buzz).
- `high`: molti dati coerenti (streak, tempo mappa, clues, rank).

---

## D) APPLE REVIEW SAFETY ASSESSMENT

### Rischi terminologia

- **Da evitare:** “probability”, “win guaranteed”, “chance to win”, “odds”, “luck”, “random win”, “guaranteed result”.
- **Da preferire:** “avanzamento”, “segnale”, “traiettoria”, “prestazione agente”, “indicatore di percorso”, “stima basata su attività”.

### Copy suggeriti (IT) — safe

- **Titolo modulo:** “Segnale di Avanzamento” o “Traiettoria Agente” (evitare “Calcolatore Performance” se suona come “predizione risultato”).
- **Disclaimer 1 riga:** “L’indicatore è basato sulla tua attività nella missione e non garantisce né predice il risultato. Il valore è indicativo e può subire lievi variazioni.”
- **Messaggi Interference:** “Il segnale può subire lievi interferenze. Usa l’indicatore come guida, non come certezza.” / “Variazioni minime del segnale sono normali e non influenzano le regole di gioco.”

### Aree di rischio da controllare

- Qualsiasi UI che dica “probabilità di vittoria” o “chance”.
- Promesse implicite (es. “se arrivi al 95% vinci”).
- Monetizzazione che suoni pay-to-win: mantenere “1 analisi gratuita + extra a pagamento” come “informazione aggiuntiva”, non “acquisto vantaggio per vincere”.

---

## E) COMPLEXITY / RISK / IMPACT

### Effort per blocco (stima)

| Blocco | Effort | Note |
|--------|--------|------|
| Data collection (snapshot) | Medio | Aggregare da profili, user_clues, user_map_areas, buzz_map_actions, user_activity_stats (serve RPC lettura o query), leaderboard rank reale; definire “commit completato”. |
| Scoring engine (formula + smoothing + noise + anti-forcing) | Medio–Alto | Logica pura + parametri; test su casi limite. |
| UI scanning (HUD) | Medio | Fase “scanning” + progress + risultato; accessibilità e performance WKWebView. |
| AION integration | Medio | Nuovo flusso/tool che inietta report nel messaggio AION; copy oracolo. |
| Supabase/RLS | Basso–Medio | Solo se serve tabella/RPC per: last percentage, snapshot giornaliero, “daily run count” / “paid runs”; RLS per user_id. |
| Testing iOS | Medio | Verifica su dispositivo reale (Capacitor), no regressioni mappa/tracking. |

### Rischi tecnici

- **WKWebView performance:** Evitare calcoli pesanti sul main thread; snapshot e engine in worker o batch brevi.
- **Realtime:** Rank e activity stats potrebbero essere “stale” se MV/table non aggiornate spesso; definire refresh policy.
- **Caching:** Coerenza 1 free/day tra client e server (es. server conta run giornalieri).
- **Offline:** Senza rete non si può avere report aggiornato; degradare a “ultimo report in cache” o messaggio “connettiti per aggiornare”.

### Impatto performance e battery

- **Mappa:** Il tracking “time on map” è già attivo (useActivityTracker); aggiungere lettura periodica di `user_activity_stats` (es. prima del run) ha impatto trascurabile se limitata.
- **Battery:** Nessun nuovo tracking continuo; solo calcolo on-demand al “run” del calculator.

---

## F) MINIMAL DECISIVE QUESTIONS

1. **Commit giornaliero:** Il “completato oggi” deve essere salvato in DB (es. `profiles.daily_commit_completed_at` o tabella `user_daily_actions`) o derivato solo da check-in / altro?
2. **user_activity_stats:** La tabella e `update_user_activity` sono effettivamente deployate in produzione? Se sì, serve un RPC `get_user_activity_snapshot(user_id)` che ritorni time_on_* e last_* per il calculator?
3. **Rank utente:** Preferenza: (A) RPC che ritorna solo “my rank” e score, (B) riuso della stessa query di useRealtimeLeaderboard lato client (con possibili limiti RLS), (C) materialized view `leaderboard_rankings` con refresh periodico + query per user?
4. **Seed rumore 10%:** Il seed giornaliero deve essere solo lato client (userId + date) o anche server-side per coerenza multi-device?
5. **Monetizzazione 5 M1U:** La deduzione va fatta lato server (RPC che verifica saldo, decrementa, poi autorizza run) o solo client-side con verifica backend?

---

## Riferimenti file (path precisi)

- Activity: `src/hooks/useActivityTracker.ts` (ROUTE_TO_PAGE, flushPageTime, update_user_activity).
- BUZZ clues: `src/hooks/useBuzzFeature.ts`, `src/hooks/useMissionStatus.ts`, `src/utils/buzzClueUtils.ts`, `src/utils/buzzConstants.ts`.
- Buzz Map: `src/hooks/useBuzzMapLogic.ts`, `src/hooks/buzz/useBuzzMapUtils.ts`, `src/hooks/map/useBuzzMapProgressivePricing.ts`.
- Cashback/M1U: `src/hooks/useCashbackWallet.ts`, `src/config/cashbackConfig.ts`.
- Leaderboard: `src/hooks/useRealtimeLeaderboard.ts`, `src/components/leaderboards/AdvancedLeaderboard.tsx`, `src/hooks/useLeaderboardPosition.ts` (simulato).
- Streak: `src/components/gamification/StreakWidget.tsx`, `supabase/functions/handle-daily-checkin/index.ts`.
- PE: `src/features/pulse/hooks/useAwardPE.ts`; RPC `record_pe_daily_action`, `get_pe_daily_stats`.
- AION: `src/pages/intel/IntelChatPanel.tsx`, `src/intel/norah/engine/contextBuilder.ts`, `src/intel/norah/engine/nextBestAction.ts`, `supabase/functions/norah-chat-v2/index.ts`.
- Commit: `src/components/commit/CommitRitual.tsx`, i18n `status_commit_label`, `commit_daily_suffix`.
- DB: `user_clues`, `user_map_areas`, `buzz_map_actions`, `user_activity_stats` (migration), `user_cashback_wallet`, `cashback_transactions`, `profiles`, `pe_daily_awards`.

---

*Report read-only. Nessuna patch, nessun commit, nessuna modifica applicata.*
