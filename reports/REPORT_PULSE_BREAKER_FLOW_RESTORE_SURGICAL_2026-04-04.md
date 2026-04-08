# Report — Pulse Breaker flow restore + hide solo legacy CelebrationModal

**Data:** 2026-04-04

---

## A. Executive summary

La regressione nasceva dall’intervento «premium flow» su `PulseBreaker.tsx`: **pipeline PE sequenziale**, **bridge**, **`PulseBreakerPremiumOutcome`** (titolo IT «Estratto con precisione»), **`postRunPhase`**, attese su `PE_REWARD_OVERLAY_SETTLED` e CTA che chiamava `onClose()` → percepito come **lag**, **step extra** e **uscita verso Home**.

**Fix:** ripristinato il **flow originale** in `PulseBreaker` (PE **in parallelo** come prima, **`pb-result-controls`** con GIOCA ANCORA, chiusura X/overlay senza stati intermedi). **Rimosso** dal prodotto il file `PulseBreakerPremiumOutcome.tsx` (non più importato).

I due modali **verde/rosso** brutti restano quelli di **Progress Feedback** (`CelebrationModal` per `PULSE_BREAKER_CASHOUT` / `PULSE_BREAKER_CRASH`); continuano a essere **soppressi** solo lì tramite **`PULSE_BREAKER_LEGACY_PROGRESS_FEEDBACK_MODALS_ENABLED === false`** (nessun impatto su altri eventi).

---

## B. Root cause della regressione introdotta

1. Introduzione di `postRunPhase` + delay **480 ms** + `pe_bridge` + `waitForNextPeOverlaySettled` → attese artificiali dopo la run.
2. **`setPostRunPhase('outcome')`** mostrava **`PulseBreakerPremiumOutcome`** (copy `pulseBreaker.outcome.winTitle` = «Estratto con precisione») **dopo** il PE, con CTA che eseguiva **`resetGame` + `onClose()`** → chiusura modale gioco / sensazione di «rientro Home».
3. Sostituzione temporanea di `pb-result-controls` con quel layer → struttura UX diversa dall’originale.

---

## C. File toccati nell’ultimo intervento (premium) e ruolo

| File | Cosa faceva |
|------|-------------|
| `PulseBreaker.tsx` | Pipeline sequenziale, bridge, outcome premium, rimozione strip `pb-result-controls` |
| `PulseBreakerPremiumOutcome.tsx` | Modale fullscreen «Estratto con precisione» / lose copy |
| `featureFlags` + `ProgressFeedbackProvider` (intervento separato) | Hide solo eventi PB su CelebrationModal |

---

## D. Modali legacy verde/rosso (100% identificati)

| Modal | Evento | Titolo default | Dove |
|-------|--------|----------------|------|
| Verde win | `PULSE_BREAKER_CASHOUT` | «💎 CASHOUT PERFETTO!» | `gameEvents.ts` → `CelebrationModal` via `ProgressFeedbackProvider` |
| Rosso lose | `PULSE_BREAKER_CRASH` | «💥 CRASH!» | Idem |

Trigger: `emitGameEvent` in `usePulseBreaker.ts` (invariato). Hide: guard in `ProgressFeedbackProvider` se flag legacy off.

**Nota:** `pb-win-banner` / `pb-lose-banner` dentro il gioco sono **UI in-page** (non i CelebrationModal globali); sono state **ripristinate** con il flow originale.

---

## E. Cosa causava «Estratto con precisione»

- **`PulseBreakerPremiumOutcome.tsx`**, titolo da **`pulseBreaker.outcome.winTitle`** (IT: «Estratto con precisione»), mostrato quando `postRunPhase === 'outcome'` dopo la pipeline.

---

## F. Strategia di fix (RESTORE + HIDE)

1. **RESTORE** `PulseBreaker.tsx` al modello pre-premium (PE parallelo, `pb-result-controls`, niente bridge/outcome).
2. **Rimuovere** `PulseBreakerPremiumOutcome` dal bundle (file eliminato).
3. **Mantenere** `PULSE_BREAKER_LEGACY_PROGRESS_FEEDBACK_MODALS_ENABLED = false` + filtro in `ProgressFeedbackProvider` (solo i due type Pulse Breaker).

---

## G. File modificati ora

- `src/features/pulse-breaker/components/PulseBreaker.tsx` — restore flow, rimossi bridge/pipeline/outcome.
- **Eliminato:** `src/features/pulse-breaker/components/PulseBreakerPremiumOutcome.tsx`.

**Invariati in questo step:** `featureFlags.ts` (flag legacy PB), `ProgressFeedbackProvider.tsx`, `usePulseBreaker.ts`, PE fullscreen.

---

## H. Test eseguiti con esito

| Test | Esito |
|------|--------|
| `npx tsc --noEmit` | **Pass** |
| TEST 1–4 su iPhone | **Non eseguiti in sede** |

---

## I. Conferma flow pulito + solo hide richiesto

- Dopo PE l’utente torna al **contenitore gioco** con **GIOCA ANCORA** come **prima** del redesign premium.
- **Non** compare più il modale «Estratto con precisione».
- **Non** compaiono i **CelebrationModal** verde/rosso (con flag legacy off e allowlist attiva).

---

## J. Go / No-Go

| Criterio | Esito |
|----------|--------|
| Flow allineato al pre–premium | **Go** (codice) |
| Solo legacy globali nascosti | **Go** |
| Device smoke | **Go condizionato** |

**Verdetto:** **Go** per merge logico; validazione iPhone consigliata per conferma percepita lag/ordine PE.

---

© 2026 M1SSION™
