# Report — Victory System V4: chiusura ufficiale e checkpoint tecnico

**Data:** 2026-04-04  
**Tipo:** verifica read-only + snapshot + rischi (nessuna modifica codice UI/conductor/modali).

---

## A. Executive summary

Il **Victory System V4 (real daily)** è implementato come **attivazione controllata** del conductor già esistente (`VictoryOrchestrationListeners`), tramite `isVictoryOrchestrationConductorEnabled()` = V1 **oppure** flag V4. Il conductor, quando attivo, intercetta in **capture** solo eventi con `source === 'daily_mission'` (PE) e `source === 'mission'` (M1U); gli altri flussi continuano a propagarsi senza `stopImmediatePropagation`.

Con **flag V4 e V1 entrambi OFF**, l’`useEffect` dei listener non registra handler: il comportamento resta quello **pre-orchestrazione** (nessun riordino forzato PE/M1U/rank da questo layer).

Questo documento **congela** lo stato logico del sistema come base per la fase successiva (allineamento modali legacy, fuori scope qui).

---

## B. Stato finale Victory System V4

| Elemento | Stato |
|----------|--------|
| Integrazione real daily | I modal daily emettono `daily_mission` / `mission` allineati al conductor |
| Sequenza PE → M1U → rank gate | Definita in `VictoryOrchestrationListeners` + `PE_REWARD_OVERLAY_SETTLED_EVENT` |
| Presentazione PE / M1U / rank | `GlobalPERewardOverlay`, `GlobalM1UCreditOverlay`, `RankUpWatcher` (invariati in questa fase) |
| Flag rollout V4 | `isVictorySystemV4RealDailyEnabled()` — env `VITE_VICTORY_SYSTEM_V4_REAL_DAILY`, LS `m1_victory_system_v4_real_daily` |
| Flag pilot V1 | `isVictoryOrchestrationV1Enabled()` — retrocompatibilità |
| QA harness | `isVictoryOrchQaHarnessEnabled()` — separato; in **DEV** è true per default |
| Provider app | `VictoryOrchestrationProvider` avvolge overlay globali e `RankUpWatcher` in `App.tsx` |

---

## C. Mappa tecnica completa (event → conductor → UI)

```
[Daily mini-game claim / server OK]
        │
        ├─► emitPECreditEvent(amount, 'daily_mission', …)
        │         │
        │         ▼
        │   [Conductor ON?]
        │     YES: capture → stopImmediatePropagation → buffer/replay
        │     NO:  bubbling normale
        │         │
        │         ▼
        │   PE_CREDIT_EVENT (eventuale replay con orchestratorReplay)
        │         │
        │         ▼
        │   GlobalPERewardOverlay (fullscreen, suoni/haptic propri)
        │         │
        │         ▼
        │   dispatch PE_REWARD_OVERLAY_SETTLED_EVENT
        │         │
        │         ▼
        │   Conductor: dopo settle → replay M1U in coda se presente
        │
        └─► emitM1UCreditEvent(amount, 'mission', …)
                  │
                  ▼
            [Conductor ON?]
              YES: capture → stopImmediatePropagation → batch/merge → replay
              NO:  bubbling normale
                  │
                  ▼
            M1U_CREDIT_EVENT → GlobalM1UCreditOverlay
                  │
                  ▼
            m1u-credited / pill + playM1USound (+ bridge PE→M1U timing)
                  │
                  ▼
            Conductor: scheduleRankRelease → blockRankUpModal = false
                  │
                  ▼
            RankUpWatcher (se pendingRankUp) → RankUpVideoModal
```

**Nota:** `useAwardPE` può emettere PE con altre `source` (es. `daily_login`, `clue_milestone`): **non** passano dal filtro `daily_mission` del conductor.

---

## D. Lista file coinvolti (snapshot logico V4)

**Orchestrazione e flag**

- `src/config/featureFlags.ts` — `isVictorySystemV4RealDailyEnabled`, `isVictoryOrchestrationConductorEnabled`, preserve keys
- `src/features/victoryOrchestration/VictoryOrchestrationContext.tsx`
- `src/features/victoryOrchestration/VictoryOrchestrationListeners.tsx`
- `src/features/victoryOrchestration/constants.ts`
- `src/features/victoryOrchestration/logging.ts` (se presente; usato da `orchLog`)

**QA (separato dal rollout prodotto)**

- `src/features/victoryOrchestration/qa/VictoryOrchQaHarnessPanel.tsx`
- `src/features/victoryOrchestration/qa/victoryOrchQaMockRank.ts` (e altri file qa nella stessa cartella se usati)

**Eventi e overlay globali**

- `src/features/pulse/peCreditEvent.ts`
- `src/features/m1u/m1uCreditEvent.ts`
- `src/features/pulse/components/GlobalPERewardOverlay.tsx`
- `src/features/m1u/GlobalM1UCreditOverlay.tsx`
- `src/features/victoryPresentation/victoryPresentationBridge.ts`
- `src/utils/victoryRewardSounds.ts`

**Rank**

- `src/components/rank/RankUpWatcher.tsx`
- `src/components/rank/RankUpVideoModal.tsx`

**Shell app**

- `src/App.tsx` — ordine mount `VictoryOrchestrationProvider` / overlay / `RankUpWatcher`

**Emitter daily (claim → eventi orchestrati)**

- `src/missions/ui/CipherDrillModal.tsx`
- `src/missions/ui/SignalPatternNumbersModal.tsx`
- `src/missions/ui/WordDuelMemoryModal.tsx`
- `src/missions/miniGames/neuroMatch/NeuroMatchModal.tsx`
- `src/missions/miniGames/pinRotatorTiming/PinRotatorTimingModal.tsx`
- `src/missions/miniGames/sheepHerd/SheepHerdModal.tsx`
- `src/missions/miniGames/ticTacToe/TicTacToeModal.tsx`

**Documentazione integrazione precedente**

- `reports/REPORT_VICTORY_SYSTEM_V4_REAL_DAILY_2026-04-04.md`

**Tipi build**

- `src/vite-env.d.ts` — `VITE_VICTORY_SYSTEM_V4_REAL_DAILY`

---

## E. Verifica flag ON/OFF

| Condizione | Conductor registrato? | Effetto |
|------------|----------------------|---------|
| V4 OFF, V1 OFF | No (`enabled === false`) | Nessun listener capture; eventi PE/M1U non intercettati da questo layer; `blockRankUpModal` resta false |
| V4 ON **oppure** V1 ON | Sì | Filtri `daily_mission` / `mission` attivi; sequencing + rank gate |
| QA harness | Indipendente | Non attivato dal solo V4; in dev spesso visibile per `import.meta.env.DEV` |

Verifica codice: `VictoryOrchestrationListeners` → `useEffect` con `if (!enabled) return;` prima di `addEventListener` (vedi file sorgente).

---

## F. Verifica isolamento sistemi core

**Filtri conductor (read-only)**

- PE handler: `detail.source !== 'daily_mission'` → **return** (nessuna intercettazione)
- M1U handler: `detail.source !== 'mission'` → **return**

**Emitter `mission` nel repo (grep):** solo modal daily elencati in sezione D + pannello QA. Non risultano altri call site produttivi con `'mission'` oltre a quelli.

**Caveat semantico (non è un bug se la convenzione si mantiene):** la stringa `'mission'` non significa “solo daily” nel tipo TypeScript; **qualsiasi** futuro emit con `source: 'mission'` verrebbe orchestrato se il conductor è ON. Oggi la superficie è limitata ai file sopra.

**Sistemi esplicitamente non toccati dal conductor** (per `source` diversa): login/IAP/BUZZ/push non sono in questa catena; reward M1U con `shop`, `wheel`, `streak`, `referral`, ecc. **non** matchano `mission`.

---

## G. Problemi rilevati (senza fix)

1. **Doppia superficie UX possibile:** il flusso daily include il **modal del mini-game** (UI locale di completamento) **e** il fullscreen PE globale; non è una “doppia implementazione” del conductor, ma **due strati** visivi in sequenza. Coerenza percepita dipende dal design di ciascun modal.
2. **Prefisso `mission` vs dominio “daily”:** come sopra, il filtro M1U è per nome sorgente, non per contesto route/feature.
3. **QA harness in DEV:** `isVictoryOrchQaHarnessEnabled()` true in `import.meta.env.DEV` — il pannello QA può sovrapporsi a sessioni di sviluppo; non influenza produzione se build senza DEV.
4. **`PinRotatorTimingModal`:** presenta più percorsi di emit (`mission`); andrebbe verificato in test manuale che non ci siano doppie emissioni nello stesso claim (solo osservazione da code review, non prova runtime qui).

---

## H. Rischi futuri

| Rischio | Descrizione |
|---------|-------------|
| Race / ordine eventi | Se in futuro un claim emettesse PE e M1U in ordine o timing non previsti, il buffer/batch del conductor potrebbe comportarsi diversamente; oggi il flusso è quello validato sui modal daily. |
| Nuovo emit con `mission` | Estensione di un’altra feature con `source: 'mission'` attiverebbe l’orchestrazione senza essere “daily”. |
| Rank-up da PE non daily | Se l’utente sale di rank per PE da `useAwardPE` con source ≠ `daily_mission`, il rank non è “in coda” allo stesso gate della sequenza daily; può comparire secondo `useHierarchyRank` indipendentemente. |
| Dipendenza da settle PE | Se `GlobalPERewardOverlay` non dispatchasse `PE_REWARD_OVERLAY_SETTLED_EVENT` in qualche edge case, la M1U buffered dopo PE potrebbe restare bloccata (mitigato dal codice overlay esistente; rischio residuo su regressioni future). |

---

## I. Lista modali / flussi legacy per fase V5 (solo inventario, nessuna modifica)

**PE globali non sotto filtro `daily_mission` (non orchestrati come daily)**

- Onboarding: `OnboardingOverlay.tsx`
- Clue milestone: `useClueMilestones.ts` (+ contesto modale)
- Battle defense: `BattleDefenseModal.tsx`
- Practice: `PracticeMode.tsx`
- Vera bomb: `useBombMissionRun.ts`
- Qualsiasi altro percorso che passa da `useAwardPE` con source diversa da `daily_mission`

**M1U globali con source ≠ `mission` (non passano dal batch conductor)**

- `StreakModal.tsx` / `StreakWidget.tsx` — `streak`
- `ClueMilestoneModal.tsx` — `clue_milestone`
- `MicroMissionsCard.tsx` — `micro_mission`
- `ScratchWinModal.tsx`, `FortuneWheel.tsx`, `LotteryContent.tsx`, `LotteryTest.tsx` — `scratch` / `wheel` / `lottery`
- `ReferralCard.tsx`, `WeeklyChallenges.tsx`, `useWelcomeBonus.ts`
- `M1UShopContent.tsx`, `CashbackVaultPill.tsx`

**Modali reward “di gioco” / secondari (spesso incapsulano logica propria)**

- Esempi: `ScratchWinModal`, `ClaimRewardModal` (marker), `BattleResultModal`, `FinalShootOverlay`, vari overlay battle/map — da classificare in V5 rispetto a obiettivo “enterprise alignment”

---

## J. Go / No-Go definitivo — V4 considerato stabile come foundation

| Criterio | Esito (da codice + inventario) |
|----------|--------------------------------|
| Conductor isolato su filtri daily concordati | **Go** (con caveat semantico `mission` in sezione F) |
| Flag OFF = nessun side effect orchestrazione | **Go** |
| Nessuna modifica richiesta in questa chiusura | **Go** (read-only) |
| Parità “premium” percepita su device | **Go condizionato** — richiede conferma su iPhone (fuori da questa analisi statica) |
| Assenza regressioni globali | **Go condizionato** — dipende da smoke manuali/IAP/BUZZ/push già pianificati nel programma QA prodotto |

**Verdetto:** **Go** per considerare **V4 chiuso come linea di base architetturale e flag-driven** nel codice attuale; **Go pieno prodotto** solo con **checklist device** completata dal team (coerente con il report integrazione V4).

---

## Allegato: traccia codice filtri (riferimento rapido)

```211:216:src/features/victoryOrchestration/VictoryOrchestrationListeners.tsx
    const peHandler = (e: Event) => {
      const ev = e as CustomEvent<PECreditEventDetail>;
      const detail = ev.detail;
      if (!detail || detail.orchestratorReplay) return;
      if (detail.source !== 'daily_mission') return;
```

```178:182:src/features/victoryOrchestration/VictoryOrchestrationListeners.tsx
    const m1uHandler = (e: Event) => {
      const ev = e as CustomEvent<M1UCreditEventDetail>;
      const detail = ev.detail;
      if (!detail || detail.orchestratorReplay) return;
      if (detail.source !== 'mission') return;
```

---

© 2026 M1SSION™ — checkpoint chiusura Victory System V4.
