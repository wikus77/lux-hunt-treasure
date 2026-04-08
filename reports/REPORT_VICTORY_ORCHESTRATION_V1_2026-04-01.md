# REPORT — Victory Orchestration V1 (Daily Pilot)

**Data:** 2026-04-01 · Scope: presentation layer only, daily pilot, feature-flagged.

---

## A. Executive summary

È stato introdotto un **thin conductor** che, con flag **OFF** (default), non intercetta nulla: comportamento legacy invariato. Con flag **ON**, intercetta in **capture** su `window` gli eventi `m1u-credit-event` con `source === 'mission'` e `pe-credit-event` con `source === 'daily_mission'`, **ferma la propagazione** verso i listener esistenti, poi **rigioca** (`orchestratorReplay: true`) in ordine:

**MAJOR (PE fullscreen) → SMALL (M1U / pill) → rilascio gate rank → STATUS (RankUpVideoModal).**

`GlobalPERewardOverlay` emette `m1-pe-reward-overlay-settled` a ogni chiusura modale per sincronizzare il passo M1U dopo PE.

---

## B. File creati / modificati

| File | Azione |
|------|--------|
| `src/config/featureFlags.ts` | `VICTORY_ORCHESTRATION_V1_ENABLED`, `isVictoryOrchestrationV1Enabled()` |
| `src/features/victoryOrchestration/constants.ts` | **Nuovo** — timing, evento settle, commento policy |
| `src/features/victoryOrchestration/types.ts` | **Nuovo** — tier/priority (estensione futura) |
| `src/features/victoryOrchestration/logging.ts` | **Nuovo** — `orchLog` |
| `src/features/victoryOrchestration/VictoryOrchestrationContext.tsx` | **Nuovo** — Provider + `useVictoryOrchestrationGate` |
| `src/features/victoryOrchestration/VictoryOrchestrationListeners.tsx` | **Nuovo** — coda, merge M1U, replay, gate rank |
| `src/features/m1u/m1uCreditEvent.ts` | `orchestratorReplay?` su detail |
| `src/features/pulse/peCreditEvent.ts` | `orchestratorReplay?` su detail |
| `src/features/pulse/components/GlobalPERewardOverlay.tsx` | `currentPayloadRef`, dispatch settle |
| `src/components/rank/RankUpWatcher.tsx` | rispetto `blockRankUpModal` |
| `src/App.tsx` | `VictoryOrchestrationProvider` avvolge stack Auth |

---

## C. Architettura implementata

- **Provider** montato dentro `AuthProvider`, **primo figlio** `VictoryOrchestrationListeners` (effetti prima degli overlay globali).
- **Capture listeners** intercettano prima dei listener bubble degli overlay.
- **Replay** con `orchestratorReplay` ignorato dal conductor (no loop).
- **Gate rank**: `blockRankUpModal` durante sequenza daily orchestrata; `RankUpWatcher` mostra il video solo se `!blockRankUpModal`.

---

## D. Policy ordine PE / M1U / Rank-up

**Deterministico:** `PE (MAJOR) → M1U (SMALL) dopo settle → dopo animazione pill, timer rank release → Rank-up (STATUS) se ancora pending.**

Motivo: il codice daily emette oggi M1U prima di PE; il conductor **bufferizza** M1U e attende **batch window** (420ms, ridotto con reduced motion) per catturare PE nello stesso tick; alla **settle** del PE overlay rigioca M1U.

---

## E. Dedup / merge / anti-stacking

- **Merge M1U:** due `mission` entro `DAILY_M1U_MERGE_WINDOW_MS` (1500ms) nello stesso buffer → importi sommati.
- **Replay guard:** stesso `id` evento rigiocato entro `DEDUP_ID_TTL_MS` (2800ms) → skip (anti doppio replay).
- **Anti-stacking fullscreen:** un solo PE “atteso” per settle (`expectingDailyPeSettleRef`); settle spurii dalla coda interna PE ignorati se non attesi.
- **Un solo blocking orchestrato alla volta** per il percorso daily pilot.

---

## F. Rischi residui

1. **`source === 'mission'`** è assunto daily-only nel repo attuale; se in futuro altri flussi usano la stessa stringa, andrebbero estesi metadati o allowlist.
2. **Coda interna PE** con più modalità daily in sequenza: solo il primo settle è “atteso”; casi estremi multi-PE dalla stessa sessione orchestrata non sono coperti in V1.
3. **`GlobalM1UCreditOverlay` `animatingRef`:** se il timing del replay M1U collide ancora con animazione precedente, il secondo credito può essere ignorato dal layer headless (comportamento preesistente).

---

## G. Test eseguiti

| Test | Esito |
|------|--------|
| `npm run build` | **PASS** |
| Test manuali iPhone / reduced motion / flag ON-OFF | **NOT RUN** (da QA device) |
| Smoke auth / IAP / BUZZ / push | **NOT RUN** (nessun tocco diretto; regressione non attesa) |

---

## H. Rollback confirmation

- Default: `isVictoryOrchestrationV1Enabled()` → **false** (nessun override env/storage).
- Immediato: non impostare `m1_victory_orchestration_v1` / `VITE_VICTORY_ORCHESTRATION_V1`.
- Opzionale: `VICTORY_ORCHESTRATION_V1_ENABLED = false` (già default) in `featureFlags.ts`.

---

## I. Qualità percepita V1

Obiettivo: **ordine** (PE poi M1U), **nessun rank sopra PE**, **meno collisioni**; non è ancora “spettacolo” premium massimo.

---

## J. Prossimo step consigliato

1. QA su build iOS con `localStorage.setItem('m1_victory_orchestration_v1','true')` + reload.
2. Log: `localStorage.setItem('m1_victory_orch_debug','true')`.
3. Estendere metadati `correlationId` dai modali daily se serve tracciamento più stretto.
4. Valutare Sunday / altri fullscreen vs `expectingDailyPeSettleRef`.

---

## Abilitazione pilot

```text
localStorage.setItem('m1_victory_orchestration_v1', 'true')
```

Oppure env build: `VITE_VICTORY_ORCHESTRATION_V1=true`

Debug log: `m1_victory_orch_debug=true`
