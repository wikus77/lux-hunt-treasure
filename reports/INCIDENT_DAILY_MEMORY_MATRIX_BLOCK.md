# INCIDENT REPORT — Daily Mission bloccata (MEMORY MATRIX)

**Data:** 2026-03-03  
**Scope:** Daily Missions UI / generic flow — fix mirato, zero regressioni FROZEN.

---

## A) Identificazione missione reale

- **Label UI:** "MEMORY MATRIX"
- **mission_id:** `memory_matrix` (senza suffisso `_v1`)
- **Definizione:** `src/missions/missionsRegistry.ts` (linee 507–533): `id: 'memory_matrix'`, `title: 'MEMORY MATRIX'`, `totalRewardM1U: 30`, `phase1.actionType: 'confirm'`, `phase2.actionType: 'input'`.
- **Mapping modal:** In `DailyMissionContent.tsx` sono gestiti solo:
  - `cipher_drill_anagram_v1` → CipherDrillModal
  - `word_duel_memory_v1` → WordDuelMemoryModal
  - `signal_pattern_numbers_v1` → SignalPatternNumbersModal  
  Non esiste un case per `memory_matrix` → **il flusso usato è il generic flow** (stesso componente che renderizza header, description, reward e CTA in base a `getMissionState()`).

- **useMissionOfTheDay():** Restituisce la missione del giorno (server/cache/fallback). Il ciclo in `daily-mission-today` e in `useMissionOfTheDay.ts` include `memory_matrix`; quindi in un giorno in cui l’indice di ciclo corrisponde a MEMORY MATRIX, `mission.id` è `memory_matrix` e il modal aperto è quello del generic flow.

---

## B) Percorso UI dalla Next Action al modal

- **Next Action:** `NextActionContent.tsx` → apertura `DailyMissionFlipOverlay` con `mission` da `useMissionOfTheDay()`.
- **Modal:** `DailyMissionContent.tsx` riceve `mission={...}`. Per `mission.id === 'memory_matrix'` nessuno dei tre `if` (Cipher/Word Duel/Signal Pattern) è vero → si usa il **generic flow** (useState per phase, getMissionState(), isPhase2Available(), ecc.).
- **Gating:** Le CTA sono mostrate solo se:
  - `isNotStarted` (phase === 0) → bottone "START MISSION"
  - `isPhase1Active` (phase === 1 && !isPhase2Ready) → "COMPLETE PHASE 1"
  - `isPhase2Pending` (phase === 2 && !isPhase2Ready) → solo messaggio "Phase 2 unlocks tomorrow" (nessun CTA azionabile)
  - `isPhase2Ready` → "COMPLETE PHASE 2"

Lo stato (`phase`, `activeMissionId`, `dayKey`) è **globale** in `missionState.ts` (chiavi `m1_daily_missions_*`), non per-missione.

---

## C) Cause probabili (confermate con codice)

### 1) Stato globale non allineato alla missione corrente

- **File:** `src/missions/missionState.ts`: un solo `activeMissionId`, un solo `phase`, un solo `dayKey` per tutta l’app.
- **File:** `src/components/feedback/DailyMissionContent.tsx` (generic flow): legge `getMissionState().phase` e non confronta mai `activeMissionId` con `mission.id` né `dayKey` con la data odierna.
- **Risultato:** Se l’utente ha già completato un’altra daily (es. Cipher Drill) in un giorno precedente, in localStorage restano ad es. `phase: 3`, `activeMissionId: 'cipher_drill_anagram_v1'`. Quando oggi la missione del giorno è MEMORY MATRIX (`memory_matrix`), il generic flow usa comunque `phase === 3`. Allora:
  - `isNotStarted` = false (phase !== 0)
  - `isPhase1Active` = false (phase !== 1)
  - `isPhase2Pending` = false (phase !== 2)
  - `isPhase2Ready` = false (isPhase2Available() richiede phase === 2)
- **Nessuna delle quattro branch rende una CTA** → l’utente vede solo header, icon, description e "TOTAL REWARD: 30 M1U", senza bottone START/COMPLETE/CONTINUE.

### 2) Nessun ramo per phase === 3

- Il generic flow non ha alcun blocco per `phase === 3` (missione completata). Quando `phase === 3` non viene mostrato né "Mission completed" né un CTA di chiusura esplicito (la X in header c’è sempre).

### 3) Altri punti esclusi

- **actionType:** MEMORY MATRIX ha `confirm` e `input`; il generic flow non distingue per actionType per la visibilità della CTA (mostra sempre START / COMPLETE PHASE 1 / COMPLETE PHASE 2 in base a phase). Quindi non è la causa del blocco.
- **Modal specifico mancante:** MEMORY MATRIX non ha modal dedicato e non è server-real; usa il generic flow. Il problema non è l’assenza di un modal specifico, ma il fatto che lo stato globale non è riferito alla missione corrente.
- **Styling:** Le CTA non sono nascoste da z-index/opacity; semplicemente non vengono renderizzate perché nessuna condizione è true.
- **i18n:** Nessun crash silenzioso rilevato; le chiavi usate (mission.popup.*, mapPills.mission.*) sono condivise e presenti.

---

## D) Strumenti di diagnosi

- **File ispezionati:**  
  `src/missions/missionsRegistry.ts`, `src/components/feedback/DailyMissionContent.tsx`, `src/missions/missionState.ts`, `src/missions/useMissionOfTheDay.ts`, `supabase/functions/daily-mission-today/index.ts`.
- **mission_id MEMORY MATRIX:** `memory_matrix`.
- **Branch UI:** Generic flow (ramo dopo i tre `if` per Cipher/Word Duel/Signal Pattern).
- **Presenza CTA nel DOM:** Le CTA sono dentro `{isNotStarted && (...)}`, `{isPhase1Active && (...)}`, `{isPhase2Pending && (...)}`, `{isPhase2Ready && (...)}`. Con phase === 3 e stato riferito ad altra missione, tutte false → nessun bottone nel tree.
- **Console:** Nessun errore runtime necessario per spiegare il blocco; il comportamento è deterministico dalla logica di gating.

---

## E) Conclusione FASE 0

**CAUSA CERTA:** Il generic flow in `DailyMissionContent.tsx` usa uno stato missione **globale** (`getMissionState()`). Quando lo stato memorizzato si riferisce a un’altra missione o a un altro giorno (es. `phase === 3` da una daily precedente), le variabili `isNotStarted`, `isPhase1Active`, `isPhase2Pending`, `isPhase2Ready` sono tutte false, quindi **nessuna CTA viene renderizzata**. Per MEMORY MATRIX (e per qualsiasi altra missione senza modal dedicato) l’utente vede solo header, descrizione e total reward.

**Punto esatto:**  
`src/components/feedback/DailyMissionContent.tsx`: uso di `phase` e `isPhase2Ready` senza verificare se lo stato è riferito alla missione corrente (`mission.id`) e al giorno corrente (`dayKey`). Manca inoltre un ramo per `phase === 3` (missione completata).

---

## Fix raccomandato (FASE 1)

- Considerare **stale** lo stato quando `activeMissionId !== mission.id` oppure `dayKey !== getTodayKey()`.
- In tal caso, trattare la missione come **non avviata** e mostrare sempre il blocco "NOT STARTED" con CTA "START MISSION".
- Opzionale: aggiungere un blocco per `phase === 3 && isStateForThisMission` ("Mission completed today") per chiarezza UX.

Implementazione: in `DailyMissionContent.tsx` (generic flow) leggere `getMissionState()` e `getTodayKey()`, definire `isStateForThisMission`, e usare `effectiveNotStarted = isNotStarted || !isStateForThisMission` per decidere se mostrare il blocco START MISSION.

---

## FASE 1 — Fix applicato (2026-03-03)

### File toccati (whitelist)
- `src/components/feedback/DailyMissionContent.tsx` — logica generic flow
- `src/locales/en/common.json` — chiave `mission.popup.completedToday`
- `src/locales/it/common.json` — idem
- `src/locales/fr/common.json` — idem

### Modifiche
1. Importato `getTodayKey` da `@/missions/missionState`.
2. Nel generic flow: lettura `state = getMissionState()`, `isStateForThisMission = state.activeMissionId === mission?.id && state.dayKey === getTodayKey()`.
3. `effectiveNotStarted = isNotStarted || !isStateForThisMission` → quando lo stato è per altra missione o altro giorno si mostra il blocco "NOT STARTED" con CTA "START MISSION".
4. Condizioni Phase 1 / Phase 2 pending / Phase 2 ready limitate a `isStateForThisMission` (così non si mostrano CTA di complete per una missione diversa).
5. Aggiunto blocco "COMPLETED TODAY" per `phase === 3 && isStateForThisMission` con messaggio i18n `mission.popup.completedToday` (EN/IT/FR).

### Build e sync
- `npm run build` — exit 0
- `npx cap sync ios` — exit 0

### Rollback
- `git reset --hard safety/daily-memory-matrix-pre` oppure checkout del branch precedente.

### Checklist test iPhone (smoke)
1. Aprire Daily Mission "MEMORY MATRIX" (o altra missione generic): deve comparire il bottone **START MISSION** (anche se in localStorage c’era phase 3 da un’altra missione).
2. Tap su START MISSION: deve passare a Phase 1 con CTA "COMPLETE PHASE 1".
3. Completare Phase 1: toast reward e chiusura; giorno dopo (o override) Phase 2 disponibile con CTA "COMPLETE PHASE 2".
4. Cipher Drill / Word Duel / Signal Pattern: nessuna regressione (modali dedicati invariati).
5. Login/Logout, Delete account, IAP, BUZZ, BUZZ MAP, Push: quick sanity check senza modifiche.
