# VERA DAILY MISSIONS — ANTI-CHEAT PLAN V2

**Data:** 2025-02-14  
**Prodotto:** M1SSION (iOS wrapped, Capacitor/WKWebView)  
**Scope:** READ-ONLY — Main VERA mission + secondary daily M1U→PE + Pulse Bar Feedback Popup

---

## A) INVENTORY FILE E ENTRYPOINTS

### A.1 Daily missions attuali (reward M1U)

| Path | Ruolo | Chiamanti |
|------|-------|-----------|
| `src/missions/missionsRegistry.ts` | Catalogo, getMissionOfTheDay, MISSIONS_REWARD_SAFE_MODE | MissionPill, DailyMissionCard, NextAction*, missionEngine |
| `src/missions/missionState.ts` | State phase 0–3, localStorage m1_daily_missions_* | missionEngine, MissionPill, DailyMissionCard, DailyMissionContent |
| `src/missions/missionEngine.ts` | handlePhase1Complete, handlePhase2Complete | DailyMissionsController |
| `src/missions/rewards/creditM1U.ts` | creditM1USafe — se SAFE_MODE salva in localStorage | MissionPill, DailyMissionCard, DailyMissionContent, missionEngine |
| `src/missions/ui/MissionPill.tsx` | Pill UI Home/Map, invoca creditM1USafe | Home.tsx, MapTiler3D.tsx |
| `src/components/feedback/DailyMissionCard.tsx` | Card Home | CommandCenterHome |
| `src/components/feedback/DailyMissionContent.tsx` | Contenuto modal | NextActionContent, DailyMissionFlipOverlay |
| `src/components/feedback/NextActionContent.tsx` | Azioni + daily mission | NextActionContainer |
| `src/components/feedback/NextActionContainer.tsx` | Container prossima azione | AppHome.tsx |

**Dove viene accreditato M1U:**
- `creditM1USafe(amount, reason)` in `src/missions/rewards/creditM1U.ts`
- Invocato da: MissionPill.tsx (righe 95, 106), DailyMissionCard.tsx (119, 130), DailyMissionContent.tsx (59, 72), missionEngine.ts (75, 92)
- Con `MISSIONS_REWARD_SAFE_MODE = true`: scrive solo in localStorage (`m1_daily_missions_pending_credits`), nessun DB

---

### A.2 PE awarding

| Path | Ruolo | Chiamanti |
|------|-------|-----------|
| `src/features/pulse/hooks/useAwardPE.ts` | awardPE(action, customAmount?, metadata) → RPC award_pulse_energy | PulseBreaker, StreakWidget, BattleCreationForm, useBuzzHandler, useMapTimeTracking, useIntelAnalyst, useForum, BuzzMapButtonSecure |
| RPC `award_pulse_energy` | p_user_id, p_delta_pe (INT, può essere negativo), p_reason, p_metadata | useAwardPE |
| RPC `check_pe_daily_limit` | Verifica limite giornaliero per azione | useAwardPE |
| RPC `record_pe_daily_action` | Registra azione nel log giornaliero | useAwardPE |

**Conferma delta negativo:** Sì. `award_pulse_energy` usa `v_new_pe := v_old_pe + p_delta_pe`; BATTLE_LOSE = -100. Nessun floor esplicito a 0 nel codice visto (va verificato in migration completa).

---

### A.3 Pulse Bar / PE UI

| Path | Ruolo | Chiamanti |
|------|-------|-----------|
| `src/features/pulse/components/PulseBarPersonal.tsx` | Personal PE bar (rank, progress, segmented bar) | CommandCenterHome |
| `src/features/pulse/components/PulseBar.tsx` | Global Pulse (pulse_state 0–100%) | Vari (PulseBarTest, ecc.) |
| `src/hooks/useHierarchyRank.ts` | Fetch profiles.pulse_energy, calcola level/progress | PulseBarPersonal, AgentEnergyPill, RankDetailModal, RankUpWatcher |
| `src/config/hierarchyConfig.ts` | HIERARCHY_LEVELS, getCurrentLevel, peThreshold | useHierarchyRank |

**Dati sorgente:** `profiles.pulse_energy` via Supabase `.from('profiles').select('pulse_energy')`.  
**Aggiornamento:** `pe:awarded` event → refetch in PulseBarPersonal; realtime `postgres_changes` su `profiles` in useHierarchyRank.

---

### A.4 PulseBarPersonal — feedback attuale

- **pe:awarded:** Listener che chiama `refetch()` (righe 42–51).
- **showPEGain:** Mostra badge "+X PE" sopra la barra quando `pulseEnergy > lastPE` (righe 54–59, 258–266). **Problema:** `lastPE` è aggiornato da `pulseEnergy`, quindi la differenza è calcolata da due fetch successivi, non dal detail dell’evento. Non mostra `oldPE`/`newPE`/`deltaPE` reali dal server.

---

## B) PROPOSTA DB/RPC (SOLO SPEC, NESSUN SQL APPLICATO)

### B.1 Tabelle suggerite

| Tabella | Colonne principali | Indici |
|---------|--------------------|--------|
| `vera_mission_runs` | id, user_id, mission_id, day_key (YYYY-MM-DD UTC), started_at, finished_at, status (active/completed/failed/abandoned), attempts_used, payload (jsonb) | (user_id, day_key), (mission_id, day_key), (user_id, mission_id, day_key) UNIQUE |
| `vera_mission_attempts` | id, run_id, attempt_num, step_data (jsonb), elapsed_ms, outcome (success/fail), created_at | (run_id) |
| `vera_mission_audit` | id, run_id, event_type, payload (jsonb), created_at | (run_id) |

### B.2 RPC con signature

| RPC | Parametri | Ritorno | Regole |
|-----|-----------|---------|--------|
| `start_vera_mission_run` | p_user_id UUID, p_mission_id TEXT, p_day_key TEXT | { run_id, expires_at } | 1 run per (user, mission, day); day_key server-side (UTC); expiry timer |
| `submit_vera_mission_step` | p_run_id UUID, p_step_data JSONB, p_elapsed_ms INT | { ok, outcome?, delta_pe? } | Valida run attiva, tentativi < max; step verificato |
| `finalize_vera_mission_run` | p_run_id UUID, p_outcome TEXT, p_elapsed_ms INT | { success, delta_pe, old_pe, new_pe } | Chiama award_pulse_energy con delta; marca run completed/failed |

### B.3 Regole anti-cheat

- 1 run attiva per (user_id, mission_id, day_key).
- N tentativi massimi per run (config per missione).
- day_key = UTC date; nessun clock client.
- RLS: user vede solo i propri run.
- Anti-replay: idempotency key su submit/finalize; timestamp server-side.

---

## C) PIANO “DAILY SECONDARIE: M1U → PE”

### C.1 Stato attuale

- Daily secondarie usano `creditM1USafe` → localStorage (SAFE_MODE).
- Nessuna validazione server; exploit: refresh, manipolazione localStorage, clock spoof.

### C.2 Piano migrazione (solo spec)

1. **Nuovo RPC** `award_pe_daily_mission` (p_user_id, p_mission_id, p_phase 1|2, p_day_key):
   - Verifica day_key = oggi (UTC).
   - Verifica che la missione sia completata per quel day (tabella `daily_mission_completions` o equivalente).
   - Chiama `award_pulse_energy` con delta positivo (es. 10–25 PE per phase).
   - Registra completamento per evitare doppio claim.

2. **Sostituire** `creditM1USafe` con chiamata a `award_pe_daily_mission` nei punti che oggi danno M1U per daily secondarie.

3. **Tabella** `daily_mission_completions` (o estensione missionState server-side):
   - user_id, mission_id, day_key, phase1_completed_at, phase2_completed_at, phase1_claimed, phase2_claimed.
   - Popolata da RPC quando l’utente completa phase 1/2 (submit dal client dopo validazione input/counter).

4. **Migrazione “safe”:** Feature flag per passare da M1U client a PE server; fallback a “niente reward” se RPC fallisce, mai doppio accredito.

### C.3 Rischi

- Doppio claim se logica non atomica.
- Sync state: oggi missionState è client; serve sorgente di verità server.
- Regressioni: MissionPill, DailyMissionCard, DailyMissionContent devono continuare a funzionare.

---

## D) SPECIFICA “PULSE BAR FEEDBACK POPUP”

### D.1 Trigger

- **Evento:** `pe:awarded` CustomEvent.
- **Condizione:** `e.detail?.success === true` e `e.detail?.deltaPE !== undefined`.

### D.2 Data source (server truth)

- `e.detail` contiene: `oldPE`, `newPE`, `deltaPE`, `rankChanged`, `oldRankId`, `newRankId` (da AwardPEResult).
- Questi valori arrivano dal RPC `award_pulse_energy` (old_pe, new_pe, delta_pe) e sono già nel detail dell’evento.

### D.3 Flow UI

1. **Listener globale** (es. in App.tsx o provider dedicato):
   - `window.addEventListener('pe:awarded', handler)`.
   - Se success e deltaPE presente → mostra PulseFeedbackPopup con `{ oldPE, newPE, deltaPE, rankChanged }`.

2. **Popup:**
   - Overlay semitrasparente o toast-like.
   - Barra progress: da oldPE a newPE (animata con Framer Motion).
   - Delta: “+X PE” (verde) o “-X PE” (rosso).
   - Se rankChanged: badge “LEVEL UP” / “RANK UP” con icon livello.
   - AnimatePresence per enter/exit.

3. **Gestione delta negativo:**
   - Colore rosso, icona warning.
   - Progress bar che “scende” da oldPE a newPE.

### D.4 Before/after affidabile senza lag

- **Sì, possibile:** `award_pulse_energy` ritorna già `old_pe` e `new_pe`. useAwardPE li mette in AwardPEResult e nel detail di `pe:awarded`.
- Nessuna doppia fetch: i valori vengono dall’RPC.
- PulseBarPersonal attualmente non usa `e.detail.oldPE/newPE/deltaPE`; usa `pulseEnergy > lastPE` dopo refetch. Il popup può invece usare direttamente il detail dell’evento.

### D.5 iOS safe-area + performance

- Popup con `padding: env(safe-area-inset-top)`, position fixed.
- Animazione leggera (opacity, transform); evitare layout complessi durante animazione.

---

## E) MATRICE FATTIBILITÀ + RISCHIO (5 VERA MISSION)

| Missione | Fattibilità (1–10) | Rischio | Note |
|----------|--------------------|---------|------|
| **(A) BOMBA / DISINNESCO** | 9 | Low | Modale self-contained, fili+sequenza+timer, RPC finalize |
| **(B) CARICO NUCLEARE 1H** | 7 | Med | Modale con timer+consegna (tap su HQ fittizio); nessuna mappa |
| **(C) OPERATION DEAD DROP** | 8 | Low | Modale con N punti, 1 corretto, tentativi limitati |
| **(D) OPERATION INTERCEPT** | 8 | Low | Modale puzzle messaggio, scelte, rumore |
| **(E) SHADOW TRACE MVP** | 7 | Low | Modale “scia astratta” (punti in sequenza); NO map changes |

Tutte come modali separati; anti-cheat via RPC server-side. Nessuna modifica a map core, Buzz, claim-marker-reward.

---

## F) PIANO IMPLEMENTAZIONE PER FASI

| Fase | Azione | QA |
|------|--------|-----|
| **Phase 0 — Verify** | Tag snapshot, backup, smoke test Home/Map/Buzz/Commit | iPhone reale |
| **Phase 1 — MVP BOMBA** | Missione Bomba modale + RPC start/submit/finalize + award_pulse_energy (PE+ / PE-) | Test anti-cheat, timer, fail flow |
| **Phase 2 — Daily secondarie → PE** | RPC award_pe_daily_mission, sostituire creditM1USafe, tabella completions | Regressione MissionPill, no doppio claim |
| **Phase 3 — Pulse Feedback Popup** | Listener pe:awarded, PulseFeedbackPopup con barra animata + delta + rank up | Verifica oldPE/newPE corretti, iOS safe-area |

---

## G) LISTA COMANDI READ-ONLY USATI

```bash
git status
git tag -l | rg -i "snapshot|rollback|daily|mission|pulse"

rg "missionsRegistry|getMissionOfTheDay|missionState|creditM1U|creditM1USafe|MISSIONS_REWARD_SAFE_MODE" src/

rg "Pulse Energy|pulse_energy|award_pulse_energy|awardPE|useAwardPE|p_delta" src/ supabase/

rg "PulseBar|Pulse bar|PulseBar|Progress|Level|PE" src/

rg "profiles\..*pulse|pulse_energy" supabase/migrations/ supabase/functions/ src/

rg "invalidateQueries|react-query|queryClient" src/

rg "useTranslation|i18next|locales" src/

rg "claim-marker-reward|RewardsLayer3D|MapTiler3D" src/ supabase/functions/
```

---

## APPENDICE 1 — i18n vera_mission.* e pulse_feedback.*

- **File:** `src/locales/{en,it,fr}/common.json`
- **Chiavi suggerite:**
  - `vera_mission.bomb.title`, `vera_mission.bomb.briefing`, `vera_mission.bomb.wire_cut`, `vera_mission.bomb.timer`, `vera_mission.bomb.fail`, `vera_mission.bomb.success`
  - `vera_mission.nuclear.title`, `vera_mission.nuclear.briefing`, ...
  - `vera_mission.dead_drop.title`, ...
  - `vera_mission.intercept.title`, ...
  - `vera_mission.shadow_trace.title`, ...
  - `pulse_feedback.gained`, `pulse_feedback.lost`, `pulse_feedback.rank_up`, `pulse_feedback.level_down`
- **Render:** `useTranslation()` / `t('vera_mission.bomb.title')` nei componenti missione e nel popup.

---

## APPENDICE 2 — Limiti tecnici + workaround

| Aspetto | Limite | Workaround |
|---------|--------|------------|
| Modali cinematici | Nessuna libreria nuova | Framer Motion + CSS già presenti |
| Anti-cheat server | Non toccare map/buzz/claim edge | Nuovi RPC dedicati vera_mission_* |
| Pulse feedback | Dove agganciarsi | Event bus `pe:awarded`; detail già contiene oldPE/newPE/deltaPE |
| react-query | Uso limitato (admin) | useHierarchyRank usa fetch + refetch; popup usa solo evento, no query |
| Before/after PE | Evitare doppia fetch | Usare `e.detail` da pe:awarded, valori da RPC |
