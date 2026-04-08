# Report — Pulse Breaker legacy result popups (forensic verify + temp hide)

**Data:** 2026-04-04

---

## A. Executive summary

I popup **verde** («💎 CASHOUT PERFETTO!») e **rosso** («💥 CRASH!») non sono nel canvas di `PulseBreaker.tsx`: provengono dal **Progress Feedback** globale (`CelebrationModal`), alimentato da `emitGameEvent('PULSE_BREAKER_CASHOUT' | 'PULSE_BREAKER_CRASH')` in `usePulseBreaker.ts`.

È stato introdotto un flag **`PULSE_BREAKER_LEGACY_PROGRESS_FEEDBACK_MODALS_ENABLED`** (default **`false`**) che fa sì che **`ProgressFeedbackProvider` ignori solo questi due tipi** di evento alla ricezione su `m1ssion:game-event`. **Nessun file cancellato**; emit e definizioni copy in `gameEvents.ts` restano intatti.

---

## B. File/componenti identificati come popup verde/rosso

| Elemento | File | Ruolo |
|----------|------|--------|
| **Titoli e copy** | `src/gameplay/events/gameEvents.ts` | `getEventCopy`: `PULSE_BREAKER_CASHOUT` → «💎 CASHOUT PERFETTO!»; `PULSE_BREAKER_CRASH` → «💥 CRASH!» |
| **Priorità major → modal** | Stesso file | `EVENT_PRIORITY_MAP`: entrambi `'major'` → `CelebrationModal` |
| **Emissione** | `src/features/pulse-breaker/hooks/usePulseBreaker.ts` | `emitGameEvent('PULSE_BREAKER_CRASH', …)` al crash; `emitGameEvent('PULSE_BREAKER_CASHOUT', …)` al cashout |
| **Stile glass** | `src/components/feedback/glassPresets.ts` | Varianti success/error per quei type |
| **Audio** | `src/components/feedback/audioFeedback.ts` | Suoni associati agli stessi type |
| **UI modale** | `src/components/feedback/CelebrationModal.tsx` | (usata da provider, non modificata) |
| **Orchestrazione** | `src/components/feedback/ProgressFeedbackProvider.tsx` | Listener `m1ssion:game-event` → `enqueueEvent` → render overlay |

**Altri consumer di `m1ssion:game-event`:** solo `ProgressFeedbackProvider` (nessun altro listener in repo).

---

## C. Condizione esatta di apertura

1. Utente in **allowlist** Progress Feedback (`PROGRESS_FEEDBACK_ALLOWLIST` + `PROGRESS_FEEDBACK_ENABLED`).
2. `auth` caricato; provider sottoscritto agli eventi.
3. Fine run Pulse Breaker → `usePulseBreaker` dispatcha `CustomEvent('m1ssion:game-event')` con detail `GameEvent` tipo `PULSE_BREAKER_CASHOUT` o `PULSE_BREAKER_CRASH`.
4. Provider chiama `enqueueEvent` → `CelebrationModal` per eventi `major`.

---

## D. Strategia scelta per hide temporaneo

- **Flag:** `PULSE_BREAKER_LEGACY_PROGRESS_FEEDBACK_MODALS_ENABLED` in `featureFlags.ts` (default `false`).
- **Guard:** in `ProgressFeedbackProvider`, prima di `enqueueEvent`, **return** se flag è `false` e `type` è uno dei due Pulse Breaker.
- **Reversibile:** impostare il flag a `true` ripristina i modali per gli utenti allowlist.
- **Non globale:** nessun altro tipo di evento è filtrato; BUZZ, Battle, ecc. invariati.

---

## E. File modificati

- `src/config/featureFlags.ts` — nuovo export costante + commento.
- `src/components/feedback/ProgressFeedbackProvider.tsx` — import flag + guard nel `handleGameEvent`.

---

## F. Conferma: NON sono stati cancellati

- `CelebrationModal`, `gameEvents.ts` copy, `usePulseBreaker` emit, `glassPresets`, `audioFeedback` **non rimossi**.
- Solo **soppressione enqueue** lato provider per due type quando il flag è off.

---

## G. Test eseguiti con esito

| Test | Esito |
|------|--------|
| Lint su file modificati | Da verificare in IDE / CI |
| TEST 1–4 su iPhone | **Non eseguiti qui** — richiesti sul device |

---

## H. Conferma flow Pulse Breaker

- **PE / pipeline / `PulseBreakerPremiumOutcome`** non dipendono da Progress Feedback.
- **emitGameEvent** continua a essere chiamato (compatibile con futuri listener/analytics).
- **Chiusura flow** resta su `PulseBreaker` + PE overlay + outcome premium; nessun passaggio obbligato attraverso `CelebrationModal` per Pulse Breaker.

---

## I. Go / No-Go per rimozione definitiva (fase successiva)

| Criterio | Valutazione |
|----------|-------------|
| Identificazione corretta sorgente | **Go** |
| Hide mirato e reversibile | **Go** |
| Nessuna rimozione fisica codice legacy | **Go** |
| Validazione su iPhone con allowlist | **Go condizionato** |

**Verdetto:** **Go** per questa fase; per **delete definitivo** o consolidamento (es. rimuovere emit se non più serviti) valutare dopo smoke su device.

---

© 2026 M1SSION™
