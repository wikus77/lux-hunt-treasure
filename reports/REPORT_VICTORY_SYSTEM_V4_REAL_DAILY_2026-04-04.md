# Report — Victory System V4 (real daily integration)

**Data:** 2026-04-04  
**Scope:** Solo layer presentazione/orchestrazione; nessuna modifica server, claim, amount, engine daily.

---

## A. Executive summary

Il flusso **daily reale** emette già gli stessi eventi che il QA harness usa per la catena **PE → M1U → rank** (`pe-credit-event` con `source: 'daily_mission'`, `m1u-credit-event` con `source: 'mission'`). Il **conductor** (`VictoryOrchestrationListeners`) filtra esattamente su quelle sorgenti: non intercetta streak, shop, BUZZ, onboarding, ecc.

L’integrazione V4 consiste nell’introdurre un **flag di rollout dedicato** (`VICTORY_SYSTEM_V4_REAL_DAILY`) che abilita lo **stesso** conductor già validato in QA, senza duplicare presenter né fork visivi. Con flag **OFF**, i listener non si registrano: comportamento invariato rispetto all’attuale produzione (nessun `stopImmediatePropagation` sulla catena daily).

---

## B. Mappa reale dei trigger daily integrati

| Punto ingresso (UI / claim) | PE (`daily_mission`) | M1U (`mission`) | Note |
|----------------------------|----------------------|-----------------|------|
| `CipherDrillModal.tsx` | sì | sì | claim post-successo |
| `SignalPatternNumbersModal.tsx` | sì | sì | idem |
| `WordDuelMemoryModal.tsx` | sì | sì | idem |
| `NeuroMatchModal.tsx` | sì | sì | idem |
| `PinRotatorTimingModal.tsx` | sì | sì | idem |
| `SheepHerdModal.tsx` | sì | sì | idem |
| `TicTacToeModal.tsx` | sì | sì | idem |

**Rank:** `RankUpWatcher` + `blockRankUpModal` dal context orchestration (invariato): quando il conductor è attivo, il rank-up resta in coda fino al rilascio gate dopo M1U/PE.

**Non coperti dal conductor (voluto):** ogni altro `emitPECreditEvent` / `emitM1UCreditEvent` con sorgenti diverse da `daily_mission` / `mission`.

---

## C. Strategia scelta (riuso vs allineamento)

**Prima scelta applicata:** riuso totale dello stack già in repo:

- `VictoryOrchestrationListeners` (sequencing, merge M1U, gate rank)
- `GlobalPERewardOverlay` + `PE_REWARD_OVERLAY_SETTLED_EVENT`
- `GlobalM1UCreditOverlay` + bridge `victoryPresentationBridge`
- `RankUpWatcher` + `RankUpVideoModal`
- Costanti timing in `features/victoryOrchestration/constants.ts`

Nessuna seconda implementazione “reale vs QA”.

---

## D. Flag introdotto / usato

| Meccanismo | Dettaglio |
|------------|-----------|
| **Funzione** | `isVictorySystemV4RealDailyEnabled()` in `src/config/featureFlags.ts` |
| **Env** | `VITE_VICTORY_SYSTEM_V4_REAL_DAILY=true` (build Capacitor / Vite) |
| **localStorage** | `m1_victory_system_v4_real_daily=true` (+ reload) |
| **Conductor ON** | `isVictoryOrchestrationConductorEnabled()` = V1 **oppure** V4 real daily |
| **Default** | OFF (nessuna costante compile-time a true) |

Il flag **V1** (`m1_victory_orchestration_v1` / `VITE_VICTORY_ORCHESTRATION_V1`) resta utile per piloti legacy; V4 è il nome operativo per rollout prodotto.

**QA harness:** sempre governato da `isVictoryOrchQaHarnessEnabled()` (dev / env QA); **non** viene attivato dal solo flag V4.

**Emergency restart:** `m1_victory_system_v4_real_daily` incluso in `VICTORY_ORCH_QA_LOCALSTORAGE_PRESERVE_KEYS`.

---

## E. File creati / modificati

| File | Modifica |
|------|----------|
| `src/config/featureFlags.ts` | `isVictorySystemV4RealDailyEnabled`, `isVictoryOrchestrationConductorEnabled`, preserve key |
| `src/features/victoryOrchestration/VictoryOrchestrationContext.tsx` | Provider usa `isVictoryOrchestrationConductorEnabled()` |
| `src/features/victoryOrchestration/qa/VictoryOrchQaHarnessPanel.tsx` | Indicatore “orch on” allineato al conductor combinato; rimosso `useMemo` stale |
| `src/vite-env.d.ts` | `VITE_VICTORY_SYSTEM_V4_REAL_DAILY` |
| `reports/REPORT_VICTORY_SYSTEM_V4_REAL_DAILY_2026-04-04.md` | Questo report |

---

## F. Cosa del QA harness è stato portato nel flow reale

Tutto ciò che il harness **simula** (eventi sintetici) nel daily reale è già emesso dai modal di claim: attivando il conductor (V4 o V1), il prodotto usa la **stessa** orchestrazione del pannello QA per PE/M1U/rank gate, stessi overlay e stessi token di presentazione (inclusi bridge audio/haptic lato overlay).

---

## G. Cosa è rimasto legacy e perché

- **Reward non daily** (streak `streak`, shop, wheel, clue milestone, ecc.): restano fuori dal conductor per design (filtri sorgente in `VictoryOrchestrationListeners`).
- **Flag V1** separato: mantenuto per compatibilità e documentazione esistente; il rollout controllato “prodotto” può usare solo V4.
- **Pannello QA**: resta entrypoint sintetico; non è necessario per il daily reale.

---

## H. Test eseguiti con esito

| Test | Esito |
|------|--------|
| Build TypeScript / Vite (`npx vite build`) | **Pass** |
| TEST 1–5 (manuali su iPhone / auth / IAP / BUZZ / push / smoke) | **Non eseguiti in CI** — richiesti in campo prima del rollout |

---

## I. Rollback strategy

1. Rimuovere `m1_victory_system_v4_real_daily` da localStorage **oppure** non impostare `VITE_VICTORY_SYSTEM_V4_REAL_DAILY` nel build; ricaricare l’app.  
2. In emergenza: stesso effetto con deploy che omette la variabile d’ambiente.  
3. Nessuna migrazione DB; nessun dato server da revertare.

---

## J. Go / No Go per rollout controllato

| Criterio | Valutazione |
|----------|-------------|
| Stesso stack del QA (no fork) | **Go** |
| Flag default OFF, reversibile | **Go** |
| Nessuna modifica server / claim / amount | **Go** |
| Allineamento feeling iPhone vs QA | **Go condizionato** — richiede TEST 3–4 su dispositivo con flag ON |
| Regressioni core (auth, IAP, BUZZ, push, routing) | **Go condizionato** — richiede TEST 5 |

**Verdetto:** **Go per merge** con flag **OFF** in produzione; **Go per rollout utenti** solo dopo completamento dei test manuali obbligatori (H).

---

© 2026 M1SSION™ — report interno integrazione V4 real daily.
