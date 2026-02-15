# VERA DAILY MISSIONS — FATTIBILITÀ, RISCHI, LIMITI TECNICI, I18N

**Data:** 2025-02-14  
**Prodotto:** M1SSION (iOS wrapped, Capacitor/WKWebView)  
**Scope:** READ-ONLY — Nessuna patch, nessuna migrazione

---

## TASK 0 — SAFETY SNAPSHOT

### Tag snapshot rilevanti già presenti

- **Nessun tag** "pre daily missions redesign" o simile.
- Tag snapshot/rollback esistenti rilevanti:
  - `SNAPSHOT_PRE_MAP_I18N_MISSIONPILL_ULTRASAFE_20260214_051148`
  - `SNAPSHOT_PRE_MAP_PILLS_MODALS_I18N_20260214_044541`
  - `SNAPSHOT_PRE_MAP_I18N_PHASE1_LOWRISK_20260214_045336`
  - `SNAPSHOT_IOS_STABLE_AFTER_CONTRAST_FIX_20260213`
  - `ROLLBACK_SAFE_POINT`
  - `P0_ROLLBACK_POINT`, `P1_ROLLBACK_POINT`, `P2_ROLLBACK_POINT`

### Comandi suggeriti (solo testo, NON eseguiti in questo task)

```bash
# Creare tag snapshot PRIMA di qualsiasi modifica daily missions
git tag -a SNAPSHOT_PRE_VERA_DAILY_MISSIONS_$(date +%Y%m%d-%H%M%S) -m "Pre Vera Daily Missions redesign - rollback point"

# Rollback immediato (se necessario)
git checkout SNAPSHOT_PRE_VERA_DAILY_MISSIONS_YYYYMMDD-HHMMSS

# Oppure reset soft mantenendo modifiche in working tree
git reset --soft SNAPSHOT_PRE_VERA_DAILY_MISSIONS_YYYYMMDD-HHMMSS
```

---

## TASK 1 — INVENTORY & ARCHITETTURA ATTUALE

### 1.1 Mappa file ed entrypoint

| Path | Ruolo |
|------|-------|
| `src/missions/missionsRegistry.ts` | Catalogo 30 missioni, `getMissionOfTheDay()`, `calculatePhaseRewards()`, `validateInput()` |
| `src/missions/missionState.ts` | State machine (phase 0–3), localStorage `m1_daily_missions_*` |
| `src/missions/missionEngine.ts` | `getEngineState`, `handlePhase1Complete`, `handlePhase2Complete` |
| `src/missions/rewards/creditM1U.ts` | `creditM1USafe` (SAFE_MODE = localStorage only) |
| `src/missions/ui/MissionPill.tsx` | Pill UI su Home e Map |
| `src/missions/ui/MissionBriefingModal.tsx` | Modal briefing iniziale |
| `src/missions/ui/MissionCompletionModal.tsx` | Modal completamento |
| `src/missions/DailyMissionsController.tsx` | Controller missioni |
| `src/components/feedback/DailyMissionCard.tsx` | Card Home |
| `src/components/feedback/DailyMissionContent.tsx` | Contenuto missione |
| `src/components/feedback/DailyMissionFlipOverlay.tsx` | Overlay fullscreen |
| `src/components/feedback/NextActionContainer.tsx` | Container "prossima azione" |
| `src/components/feedback/NextActionContent.tsx` | Azioni (map, buzz, aion) + daily mission |
| `src/components/gamification/StreakModal.tsx` | Streak + check-in (separato) |
| `src/components/gamification/StreakPill.tsx` | Pill streak |

### 1.2 Scelta missione, state, reset, reward

| Aspetto | Implementazione |
|---------|-----------------|
| Scelta missione | `getMissionOfTheDay()` → `MISSIONS_REGISTRY[dayOfYear % 30]` |
| Storage state | localStorage: `m1_daily_missions_active_id`, `phase`, `day_key`, `phase1_completed_at`, `progress_data`, ecc. |
| Reset | `getTodayKey()` = `new Date().toISOString().split('T')[0]` (timezone browser) |
| Reward | `creditM1USafe()` → con `MISSIONS_REWARD_SAFE_MODE=true` salva solo in localStorage, nessun DB |
| Exploit | Alto: refresh, manipolazione localStorage, clock spoof (`getTodayKey`) |

### 1.3 Schema "as-is" (diagramma testuale)

```
┌─────────────────────────────────────────────────────────────────┐
│                     DAILY MISSIONS AS-IS                         │
├─────────────────────────────────────────────────────────────────┤
│  missionsRegistry.ts  →  getMissionOfTheDay() [dayOfYear % 30]   │
│         │                                                         │
│         ▼                                                         │
│  missionState.ts  ←──  localStorage (m1_daily_missions_*)        │
│         │              - phase (0|1|2|3)                         │
│         │              - day_key (YYYY-MM-DD)                    │
│         ▼                                                         │
│  missionEngine.ts  →  handlePhase1Complete / handlePhase2Complete│
│         │                                                         │
│         ▼                                                         │
│  creditM1U.ts  →  creditM1USafe() [SAFE_MODE = localStorage]     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STREAK / CHECK-IN (separato)                                    │
│  StreakModal.tsx  ←  Supabase profiles (last_check_in_date)      │
│  RPC / edge → award PE, update streak                            │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 Hook points (file e riferimenti)

| Hook | File | Come intercettare |
|------|------|-------------------|
| **Map tap/marker** | `MapTiler3D.tsx` (handleClick), `RewardsLayer3D.tsx`, `ClaimRewardModal.tsx` | `map.on('click')` già presente; ClaimRewardModal invoca `claim-marker-reward` edge |
| **Buzz press** | `BuzzPage.tsx`, `useBuzzApi` | Eventi Buzz → `awardPE('BUZZ_CLICK')` |
| **AION chat submit** | `IntelChatPanel.tsx` | `norah-chat-v2` edge; nessun PE diretto da missioni |
| **Commit ritual** | `CommitRitual.tsx`, `CommitNodesContainer.tsx` | `onComplete` / eventi completion |
| **Streak check-in** | `StreakModal.tsx` | Update `profiles` via RPC |
| **Pulse Breaker** | `PulseBreaker.tsx`, `usePulseBreaker` | `awardPE('PULSE_BREAKER_WIN')`, `progressData.pulse_breaker_wins` |
| **Marker claim** | `ClaimRewardModal.tsx` | `supabase.functions.invoke('claim-marker-reward')` → **BLOCKER se tocchi edge** |
| **Map move/zoom** | `MapTiler3D.tsx`, `DevAreasPanel`, `RewardZoneLayer3D` | `map.on('move')`, `map.on('zoom')`; `map.getCenter()` disponibile |
| **Map bounds** | `MapTiler3D.tsx` | `maplibregl.LngLatBounds`, `map.fitBounds` |

**Comandi read-only utili:**
```bash
rg "map\.on|getCenter|getBounds" src/
rg "handleClick|ClaimRewardModal|claim-marker" src/
rg "awardPE|useAwardPE" src/
rg "completePhase1|completePhase2|startMission" src/
```

---

## TASK 2 — FATTIBILITÀ 5 "VERA DAILY MISSIONS"

### Missione 1 — CARICO NUCLEARE (1h)

| Criterio | Valutazione |
|----------|-------------|
| **UI fattibile?** | 7/10 — Serve overlay mappa con zona target + indicatore "consegna" |
| **Trigger/eventi fattibili?** | 6/10 — Serve area geografica + check "consegna" (tap su HQ). Area target può essere bounds virtuale. |
| **Timer affidabile?** | 4/10 — Client-only = clock spoof. Server-side richiede edge/DB. |
| **Anti-cheat fattibile?** | 3/10 — Senza RPC/DB: alto rischio. Con RPC: medio. |
| **Coerenza iOS** | 8/10 — Mappa già usata; gesture OK |
| **Feasibility Score** | **5.6/10** |

**Rischi:** Exploit (clock spoof, manipolazione localStorage), regressioni overlay mappa.  
**Dipendenze:** MapTiler3D, bounds/area logic (parziale), **manca** RPC per timer/validazione.  
**Implementazione SAFE:** MVP = modale con timer client + "consegna" = tap su punto fittizio (no geo reale). Phase 2 = area mappa + RPC. Stop: non toccare claim-marker-reward o buzz flow.  
**Complessità:** L | Rischio: High  

---

### Missione 2 — BOMBA / DISINNESCO (modale interattivo)

| Criterio | Valutazione |
|----------|-------------|
| **UI fattibile?** | 9/10 — Modale con Framer Motion, fili cliccabili, sequenza |
| **Trigger/eventi fattibili?** | 9/10 — Tutto in modale, nessun hook esterno |
| **Timer affidabile?** | 5/10 — Stessi limiti Missione 1 |
| **Anti-cheat fattibile?** | 6/10 — Modale self-contained; claim 1/giorno via RPC |
| **Coerenza iOS** | 9/10 — Haptics già usati, modali stabili |
| **Feasibility Score** | **7.6/10** |

**Rischi:** Exploit basso se solo modale; regressioni UI modali.  
**Dipendenze:** Framer Motion, GlassModal/pattern modali, haptics. **Tutto presente.**  
**Implementazione SAFE:** MVP = modale bomba con 2–3 fili, sequenza fissa, timer client, PE +/- via `awardPE` (CUSTOM con delta negativo per fail). Phase 2 = varianti fili/sequenze. Stop: non cambiare routing o layout root.  
**Complessità:** M | Rischio: Low  

---

### Missione 3 — OPERATION DEAD DROP (punto corretto tra falsi)

| Criterio | Valutazione |
|----------|-------------|
| **UI fattibile?** | 8/10 — Griglia punti o mappa con marker; tap su uno |
| **Trigger/eventi fattibili?** | 8/10 — Tap su punto; logica random del "giusto" |
| **Timer affidabile?** | 5/10 — Come Missione 1 |
| **Anti-cheat fattibile?** | 6/10 — Tentativi limitati lato client; server = 1 claim/giorno |
| **Coerenza iOS** | 9/10 |
| **Feasibility Score** | **7.2/10** |

**Rischi:** Exploit medio (retry infinito se client-only).  
**Dipendenze:** Modali, eventualmente mappa semplificata o griglia custom. **Presenti.**  
**Implementazione SAFE:** MVP = modale con N cerchi/target, 1 corretto (random), tentativi limitati, timer. Phase 2 = overlay su mappa con punti. Stop: non toccare map core.  
**Complessità:** M | Rischio: Low–Med  

---

### Missione 4 — OPERATION INTERCEPT (messaggio cifrato/rotto)

| Criterio | Valutazione |
|----------|-------------|
| **UI fattibile?** | 8/10 — Modale con frammenti, drag/select, scelta interpretazione |
| **Trigger/eventi fattibili?** | 9/10 — Tutto in modale |
| **Timer affidabile?** | 5/10 — Come Missione 1 |
| **Anti-cheat fattibile?** | 7/10 — Puzzle deterministico, 1 completion/giorno |
| **Coerenza iOS** | 9/10 |
| **Feasibility Score** | **7.6/10** |

**Rischi:** Basso.  
**Dipendenze:** Modali, Framer Motion. **Presenti.**  
**Implementazione SAFE:** MVP = modale con testo frammentato + 2–3 interpretazioni; scelta corretta = PE+, sbagliata = PE-. Phase 2 = più puzzle, rumore grafico. Stop: nessuno critico.  
**Complessità:** M | Rischio: Low  

---

### Missione 5 — OPERATION SHADOW TRACE (scia sulla mappa)

| Criterio | Valutazione |
|----------|-------------|
| **UI fattibile?** | 5/10 — Serve layer/overlay sulla mappa con path animato |
| **Trigger/eventi fattibili?** | 4/10 — Serve tracciare posizione utente (pan) vs path; "deviazioni = fail" richiede logica bounds/path |
| **Timer affidabile?** | 5/10 |
| **Anti-cheat fattibile?** | 5/10 |
| **Coerenza iOS** | 6/10 — Performance overlay + gesture potrebbe essere pesante |
| **Feasibility Score** | **5.0/10** |

**Rischi:** **BLOCKER potenziale** — toccare map core (layer, bounds, path) per "seguire scia".  
**Dipendenze:** MapTiler3D, layer custom, path/geojson. **Mappa:** `map.on('move')` esiste; **manca** logica "path da seguire" e "decadimento traccia".  
**Implementazione SAFE:** MVP **non invasivo** = modale con "scia" semplificata (linea che si dissolve, utente clicca punti in ordine entro tempo). Zero modifica a MapTiler3D. Phase 2 = layer su mappa solo se si aggiunge senza toccare layer esistenti. Stop: **non modificare** RewardsLayer3D, AreasLayer3D, handleClick, o core map init.  
**Complessità:** XL | Rischio: High  

---

## TASK 3 — LIMITI TECNICI CURSOR + WORKAROUND

### 3.1 Modale bomba “realistico” con tensione

| Domanda | Risposta |
|---------|----------|
| **Fattibile?** | Sì |
| **Approccio** | Framer Motion (`motion.div`, `AnimatePresence`) per pulsazione, countdown, fili; CSS per glow/blur; opzionale SVG per fili. Nessuna libreria nuova. |
| **Workaround "safe"** | Modale con stato "tensione" (opacity pulse, colore rosso/verde), countdown numerico, fili come bottoni con `whileHover`/`whileTap`. Sufficiente per “memorabile” senza canvas o librerie pesanti. |

### 3.2 Scia da seguire sulla mappa (Shadow Trace)

| Domanda | Risposta |
|---------|----------|
| **Serve toccare map core?** | Per la versione “vera” (scia geografica sulla mappa): **sì** — servirebbe un layer custom con path GeoJSON, evento `move` per confrontare centro view con path, logica di "dentro/fuori traccia". |
| **Perché** | MapLibre non ha “path da seguire” nativo; va implementata logica custom. |
| **MVP non invasivo** | Modale con “scia” astratta: linea di punti che si illuminano in sequenza; l’utente deve cliccare nell’ordine entro tempo. Nessuna modifica a MapTiler3D. |

### 3.3 i18n IT/EN/FR

| Domanda | Risposta |
|---------|----------|
| **Fattibile?** | Sì, con infrastruttura attuale |
| **Pattern** | `useTranslation()` da `react-i18next`, chiavi in `src/locales/{en,it,fr}/common.json`, namespace `common`. Fallback `en`. |
| **Evitare hardcoded** | Tutti i testi in chiavi tipo `vera_mission_bomb_title`, `vera_mission_bomb_wire_cut`, `vera_mission_bomb_timer`, ecc. |
| **Esempio chiavi** | `mapPills.mission.*` già usato; estendere con `vera_mission.*` per le nuove missioni. |

### 3.4 Timer / penalità PE “sicuri” (server-side)

| Domanda | Risposta |
|---------|----------|
| **Senza cambiare DB/edge?** | **No.** Validazione “timer rispettato” e “1 attempt/giorno” richiedono RPC o edge. |
| **Attuale** | `award_pulse_energy(p_delta_pe)` supporta delta **negativo** (es. BATTLE_LOSE: -100). Quindi PE- è supportato lato DB. |
| **Strategia a fasi** | Phase 0: timer e PE solo client (accettabile rischio per MVP). Phase 1: RPC `complete_vera_mission(mission_id, elapsed_ms, payload)` che valida tempo e daily limit, poi chiama `award_pulse_energy`. |
| **Rischio client-only** | Clock spoof, refresh per retry, manipolazione localStorage. |

### Tabella LIMITI / WORKAROUND / RISCHIO

| Aspetto | Limite | Workaround | Rischio |
|---------|--------|------------|---------|
| Modale bomba | Nessuno significativo | Framer Motion + CSS | Low |
| Scia mappa | Richiede layer/path su map | MVP modale “scia astratta” senza map | High se si tocca map |
| i18n | Nessuno | `useTranslation`, chiavi `vera_mission.*` | Low |
| Timer server-side | Richiede RPC/edge | Phase 0 client; Phase 1 RPC | Med se solo client |
| PE- (penalità) | Nessuno | `awardPE('CUSTOM', -X)` con RPC | Low |

---

## TASK 4 — RACCOMANDAZIONE FINALE

### Top 2 missioni per MVP

1. **BOMBA / DISINNESCO (Missione 2)** — Più fattibile, massimo impatto emotivo, zero dipendenze da map/buzz/edge. Modale self-contained.
2. **OPERATION INTERCEPT (Missione 4)** — Puzzle testuale, facile da variare, basso rischio.

### Non implementare subito

- **CARICO NUCLEARE** — Dipende da area mappa + timer server; rischio alto.
- **SHADOW TRACE** — Richiede modifiche a map core; MVP modale “scia astratta” possibile ma meno immersivo.
- **DEAD DROP** — Buon candidato Phase 2, non prioritario.

### Piano a fasi

| Fase | Azione | QA |
|------|--------|-----|
| **Phase 0 — Verify** | Tag snapshot, backup, verifica app stabile su iPhone | Smoke test Home, Map, Buzz, Commit |
| **Phase 1 — MVP** | Missione Bomba: modale, 2–3 fili, timer client, PE +/- via `awardPE` (CUSTOM). Nessuna modifica a missionState/missionsRegistry esistenti; nuova entry “vera mission” separata. | Test su dispositivo iOS reale |
| **Phase 2 — Immersion** | Varianti fili/sequenze; opzionale RPC per timer/anti-cheat; i18n completa IT/EN/FR | Regressione full |

### Cosa NON fare

- Non modificare **Buzz flow**, **claim-marker-reward**, **map core** (RewardsLayer3D, AreasLayer3D, handleClick).
- Non cambiare **DB schema** o **edge functions** senza piano separato.
- Non introdurre **timer server-side** senza RPC dedicato.
- Non hardcodare testi; usare sempre i18n.

### Precondizioni tecniche

- **Server-side validation per PE:** RPC tipo `complete_vera_mission` che verifica tempo, daily limit, e chiama `award_pulse_energy` (anche con delta negativo).
- **i18n:** Aggiungere chiavi in `common.json` (en, it, fr) per tutte le stringhe missione.

### Metriche di successo

- Completion rate missione
- Session length (prima/dopo)
- D1/D7 retention
- Tasso di fallimento (PE-) vs successo (PE+)

---

## APPENDICE A — Cose da verificare (comandi read-only)

| Verifica | Comando |
|----------|---------|
| Tag pre-redesign esistenti | `git tag -l \| rg -i snapshot` |
| Presenza map events | `rg "map\.on\(" src/pages/sandbox/MapTiler3D.tsx` |
| Chiavi i18n mission | `rg "mapPills\.mission|mission_" src/locales/` |
| RPC award_pulse_energy | `rg "award_pulse_energy" supabase/migrations/` |
| Edge claim-marker-reward | `ls supabase/functions/claim-marker-reward/` |
| useAwardPE CUSTOM/delta | `rg "customAmount|CUSTOM" src/features/pulse/hooks/useAwardPE.ts` |

---

## APPENDICE B — Comandi read-only utili

```bash
# Verifica tag snapshot
git tag -l | rg -i "snapshot|rollback|daily|mission"

# Hook points
rg "map\.on\(|getCenter|getBounds" src/
rg "awardPE|useAwardPE" src/
rg "completePhase1|completePhase2" src/
rg "claim-marker-reward" .

# i18n mission
rg "mapPills\.mission|mission_timer|daily_" src/locales/

# PE
rg "award_pulse_energy|p_delta_pe" supabase/
```
