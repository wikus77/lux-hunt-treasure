# REPORT — Victory Orchestration QA CTA Harness (2026-04-03)

## A. Executive summary

È stato aggiunto un **pannello QA/dev-only** montato globalmente sotto `VictoryOrchestrationProvider`, visibile **solo** se `isVictoryOrchQaHarnessEnabled()` è vero (env e/o `localStorage`). Quattro CTA inviano **solo eventi client** (`m1u-credit-event`, `pe-credit-event`) con `source` allineati al conductor (`mission`, `daily_mission`), senza chiamate server. Il caso **FULL** mostra un **rank mock** locale dopo la sequenza orchestrata (o dopo fallback ~9.5s se il conductor non intercetta). È stata anche **corretta** l’emissione di `m1-pe-reward-overlay-settled` in `GlobalPERewardOverlay` (bug: variabile `settledId` non definita), necessaria al conductor per il passo PE → M1U.

## B. Soluzione UI QA scelta

- **Pannello flottante** in basso a sinistra, `z-index` 1_000_000 (sotto PE fullscreen 999998 e rank mock 999999999).
- Etichetta **Victory Orch QA**, stato **Orch: ON/OFF**, pulsante **minimizza** (−) → tab **QA Orch**.
- Quattro pulsanti come da specifica.

## C. File creati / modificati

| File | Azione |
|------|--------|
| `src/features/victoryOrchestration/qa/VictoryOrchQaHarnessPanel.tsx` | Creato |
| `src/features/victoryOrchestration/qa/VictoryOrchQaRankMockModal.tsx` | Creato |
| `src/features/victoryOrchestration/qa/victoryOrchQaHarnessLog.ts` | Creato |
| `src/config/featureFlags.ts` | `isVictoryOrchQaHarnessEnabled()` |
| `src/features/m1u/m1uCreditEvent.ts` | `metadata` opzionale + terzo argomento opzionale su `emitM1UCreditEvent` |
| `src/features/pulse/components/GlobalPERewardOverlay.tsx` | Sync `currentPayloadRef` + `settledId` al close |
| `src/App.tsx` | Mount `<VictoryOrchQaHarnessPanel />` |
| `src/vite-env.d.ts` | Dichiarazioni `VITE_VICTORY_*` |

## D. Flag introdotti

| Flag | Effetto |
|------|---------|
| `VITE_VICTORY_ORCH_QA_HARNESS=true` | Abilita harness (build QA) |
| `localStorage` `m1_victory_orch_qa_harness` = `'true'` | Abilita harness (dopo reload) |
| Esistente `m1_victory_orchestration_v1` / `VITE_VICTORY_ORCHESTRATION_V1` | Conductor ON/OFF (indipendente) |

Se **nessuno** degli abilitatori QA è attivo → **nessun** nodo harness in albero (return `null` immediato).

## E. Scenari CTA implementati

1. **QA • M1U** — `emitM1UCreditEvent(7, 'mission', { metadata: { qaHarness, scenario } })`
2. **QA • PE** — `emitPECreditEvent(11, 'daily_mission', { qaHarness, scenario })`
3. **QA • PE + M1U** — M1U poi PE nello stesso tick (conductor: buffer M1U → PE → settle → replay M1U)
4. **QA • FULL** — come (3) con `qaRankFollowup: true` su metadata M1U; ascolto **capture** su `m1u-credit-event` con `orchestratorReplay` per programmare rank mock dopo `RANK_GATE_RELEASE_AFTER_M1U_MS + 120ms`; **fallback** 9.5s se non arriva replay (orch OFF).

## F. Strategia rank simulato

- Componente dedicato `VictoryOrchQaRankMockModal`: testo **QA · Rank (mock)**, nessun uso di `useHierarchyRank`, nessuna API, nessun `RankUpWatcher`.

## G. Logging disponibile

- Prefisso console: **`[VictoryOrchQA]`** (`victoryOrchQaHarnessLog.ts`): `scenario_start`, `dispatch_*`, `pe_overlay_settled`, `intercept_m1u_replay`, `schedule_rank_after_gate`, `release_rank_qa_mock`, `full_fallback_rank`, ecc.
- Conductor: log **`[VictoryOrch]`** restano come da `logging.ts` (in prod serve `m1_victory_orch_debug=true`).

## H. Safety guarantees

1. UI harness solo se flag QA ON.  
2. OFF → pannello non montato.  
3. Nessuna RPC / Edge / Supabase dai pulsanti QA.  
4. Gli emit aggiornano solo flusso presentazione (overlay M1U/PE come in produzione); importi piccoli (7 / 11) solo per riconoscimento in log.  
5. Rank FULL è solo modale QA locale.  
6. Nessuna modifica a header, bottom nav, routing, daily engine, CTA Gioca.

## I. Test eseguiti con esito

- `npm run build` — **OK** (workspace).

Test su **iPhone reale** da eseguire dal possessore del device (non eseguiti in CI qui).

## J. Rollback confirmation

- Rimuovere flag env / `localStorage` e ricaricare → pannello sparisce.  
- Opzionale: revert commit che aggiunge harness + fix overlay.

## K. Istruzioni iPhone (pannello visibile)

1. Build con **`VITE_VICTORY_ORCH_QA_HARNESS=true`** in `.env` usato da Capacitor, oppure su WKWebView: `localStorage.setItem('m1_victory_orch_qa_harness','true'); location.reload()`.
2. Per conductor: `localStorage.setItem('m1_victory_orchestration_v1','true'); location.reload()` (o env equivalente).
3. Aprire app → il pannello compare **in basso a sinistra**.

## L. Go / No-Go banco prova ufficiale

**Go** per iterazione QA su **presentazione e ordine** PE / M1U / gate rank, con build QA flaggata.  
**No-Go** come sostituto del test end-to-end daily reale (reward server, progressione giornaliera) — resta separato.

---

© 2026 Joseph MULÉ — M1SSION™
