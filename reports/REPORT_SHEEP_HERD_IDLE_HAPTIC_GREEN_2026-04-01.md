# REPORT FORENSICS + FIX — `sheep_herd_v1` ANIMAZIONE + HAPTIC + RECINTO VERDE

## 1. FORENSICS SUMMARY

- **Cosa mancava:** le pecore avevano accelerazione **solo** quando il driver era dentro `scareR`; fuori da quella zona `ax, ay` restavano nulli e la velocità decadeva con attrito → aspetto **quasi statico**. Il recinto era **solo cyan** anche all’ingresso; nessun **haptic** sul delta `trapped`.
- **Punto movimento:** `stepFlock` in `sheepHerdPhysics.ts` è l’unico posto coerente per forze leggere che rispettano bounds, trap e lost — non serve fake draw-only se la forza è scalata e spenta vicino al cane.
- **Ingresso recinto:** già rilevato in fisica con `s.trapped = true`; nel canvas esisteva `afterT > prevTrapped` per `penPulseFrames` → stesso hook per **haptic** e **green**.
- **Haptic app:** `@/utils/haptics` espone `hapticSelection`, `hapticLight`, … e `isHapticsAvailable()` (alias runtime Capacitor nativo). Chiamare senza guard su web **DEV** può far throw dal guard interno → si usa **`isHapticsAvailable()`** prima di `hapticSelection()`.

## 2. FILE ANALIZZATI

| File | Ruolo | Coinvolgimento |
|------|--------|----------------|
| `SheepHerdGameCanvas.tsx` | RAF, HUD, pulse, haptic | Alto |
| `sheepHerdPhysics.ts` | Forze, trap/lost | Alto |
| `sheepHerdDraw.ts` | `drawPenTarget` | Medio |
| `sheepHerdTypes.ts` | `SheepAgent` | Basso |
| `@/utils/haptics.ts` | Wrapper Capacitor | Riuso (import) |

## 3. ROOT CAUSE / DECISIONI TECNICHE

- **Movimento:** **fisico reale** — `wanderPhase` per pecora + accelerazione sinusoidale lenta (`IDLE_WANDER_STRENGTH`, `IDLE_PHASE_SPEED`), moltiplicata per `idleWeight`: **1** fuori dallo scare, **`(d/scareR)^1.35`** dentro (0 se `d≈0` sul driver). Così il gregge “respira” senza competere con la fuga vicino al controllo.
- **Trap:** invariata (`len < penR - 0.012`); wander non applicata a `trapped`/`lost`.
- **Haptic:** **una** `hapticSelection()` per frame in cui `afterT > prevTrapped` (anche se Δ=2 stesso frame → un solo colpo; niente burst N-per-pecora).
- **Verde:** stato scalare `greenSafe01` nel loop: bump su nuovo trapped (+ stacking leggero se Δ>1), decay ~0.028/frame; passato a `drawPenTarget` per fill radiale soft + stroke/shadow **cyan→mint**.

## 4. FILE TOCCATI

| File | Modifica | Motivo | Rischio |
|------|-----------|--------|---------|
| `sheepHerdTypes.ts` | `wanderPhase` | Stato wander | Basso |
| `sheepHerdPhysics.ts` | Idle wander + spawn | Vita al gregge | Basso (tuning) |
| `sheepHerdDraw.ts` | `safeGreen01` su pen | Feedback “safe” | Basso |
| `SheepHerdGameCanvas.tsx` | `greenSafe01`, haptic guard | UX + iOS | Basso |

## 5. FIX APPLICATI

- **Idle:** wander morbido deterministico, attenuato vicino al driver.
- **Haptic:** `hapticSelection` se `isHapticsAvailable()` quando aumenta `trapped`.
- **Recinto verde:** blend elegante (fill interno + bordo/glow) guidato da `greenSafe01` decrescente.

## 6. TEST ESEGUITI

- `npm run build` — OK.
- `npm run cap:ios:incremental` — OK (stessa sessione di sviluppo).
- Playtest device: idle, herd, trap, haptic, non regressione — **manuale su iPhone**.

## 7. RISCHI RESIDUI

- Wander lieve aumenta micro-movimento verso i bordi; i bounce esistenti mitigano. Se troppo vivo, ridurre `IDLE_WANDER_STRENGTH`.

## 8. GO / NO GO

- **GO:** rifinitura richiesta implementata; **testabile su iPhone** dopo sync Capacitor.
- **Prossimo mini-game:** sì dopo smoke sul device.

## 9. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
