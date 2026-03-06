# M1U Slot Loop — FASE 1 Debug temporaneo

**Data:** 2026-03-05  
**Tag rollback:** `safety/m1u-slotloop-debug-pre-20260305-0618`

---

## Modifiche applicate (solo `M1UPill.tsx`)

- **Flag:** `DEBUG_M1U_PILL = true` in cima al file (da impostare a `false` o rimuovere in FASE 4).
- **Instance fingerprint:** `instanceIdRef` = `pill-<timestamp>-<random>`; log su mount/unmount con `id` e `route`.
- **Evento `m1u-credited`:** log con `id`, `amount`, `animatingRef`, `displayedRef`, `unitsDataBalance`, stack light (prime 6 righe).
- **Refetch:** ogni chiamata a `refetch()` preceduta da log `[refetch:call]` con `id` e `source` (credited | balanceChanged | buzzAreaCreated | buzzClueCreated | m1u-spent).
- **animateBalance:** log `[animateBalance:start]` (id, start, target, dur, animatingRef); log `[animateBalance:raf]` throttled ogni 500 ms; log `[animateBalance:complete]` a fine; log `[animateBalance:forceStop]` in `forceStopAnimation`.
- **Balance effect:** log `[balanceEffect]` con id, prevBalance, newBalance, animatingRef, isAnimating, willAnimate, reason (init | diff_animate | diff_small | diff_large | animating).

---

## Istruzioni test (FASE 2)

1. **Build iOS** come da procedura: `npm run build` e `npx cap sync ios`.
2. **Apri Xcode**, avvia l’app su dispositivo o simulatore e apri la **console** (View → Debug Area → Activate Console).
3. **Scenario:**
   - Apri **Home** (pill visibile).
   - Apri **Shop** dal pill (“+ M1U”).
   - Compra un pack (sandbox ok).
   - Osserva: overlay pill + animazione slot.
   - Chiudi il modale e torna in Home.
   - Verifica se l’animazione continua (loop).
4. **Raccolta log:** in console Xcode filtra le righe che contengono `[M1UPill]` (o cerca “M1UPill”).
5. **Copia** tutte le righe `[M1UPill]` dall’inizio dello scenario (apertura Home) fino a ~10 s dopo la chiusura del modale.
6. **Incolla** il blocco in `reports/M1U_SLOT_LOOP_DEBUG_PHASE2_LOGS.md` (sostituendo la sezione “Log filtrati” o creando il file se non esiste).

---

## Cosa verificare nei log (per root cause)

- **Quante istanze pill:** conta i diversi `id=` nei log `[mount]` e `[unmount]`. Es.: due `id=pill-...` diversi = due istanze (Home + overlay).
- **Chi riceve `m1u-credited`:** per ogni log `[m1u-credited]` annota l’`id`. Se lo stesso evento appare per due id diversi, entrambe le istanze ricevono l’evento.
- **Quante volte `animateBalance:start`:** conta e annota da quale `id` parte ogni avvio. Se dopo la chiusura del modale vedi ancora `animateBalance:start` o `animateBalance:raf` per l’istanza Home, l’animazione continua su quell’istanza.
- **Hard stop:** verifica se compare `[animateBalance:forceStop]` o `[animateBalance:complete]` per ogni avvio; se mancano, l’animazione potrebbe non terminare.
- **Refetch in loop:** conta i log `[refetch:call]` e le `source`. Se dopo il credited vedi molte `refetch:call source=balanceChanged` in sequenza, il refetch/realtime potrebbe innescare il balance effect più volte.
- **Balance effect che riavvia:** cerca `[balanceEffect]` con `willAnimate=true` e `reason=diff_animate` dopo il primo credited. Se appare dopo ~100–500 ms dal credited, l’effect sta riavviando `animateBalance` al ritorno del refetch.

---

## Prossimo passo

Dopo aver eseguito il test e incollato i log in `reports/M1U_SLOT_LOOP_DEBUG_PHASE2_LOGS.md`, indicare la **root cause certa** in base ai punti sopra. Da lì si applica il fix mirato (FASE 3) e il cleanup debug (FASE 4).
