# M1U Slot Loop — FASE 0 Forensics (Read-Only)

**Data:** 2026-03-05  
**Tag rollback:** `safety/m1u-slotloop-debug-pre-20260305-0618`

---

## 1. Elenco trigger possibili (sorgenti di re-trigger)

| # | Trigger | File:riga / funzione | Descrizione |
|---|--------|----------------------|-------------|
| 1 | Evento `m1u-credited` | M1UPill.tsx:165–176 `handleM1UCredited` | Handler che avvia `animateBalance`; se due istanze pill (Home + overlay) entrambe ricevono → due animazioni. |
| 2 | Evento `m1u-balance-changed` | M1UPill.tsx:116, 122 → `handleRefresh` → `refetch()` | Chiama `refetch()`; al ritorno `unitsData.balance` cambia e l’effect “balance change” (righe 194–211) può chiamare `animateBalance`. |
| 3 | `refetch()` in `handleM1UCredited` | M1UPill.tsx:172 `setTimeout(() => refetch(), 100)` | 100 ms dopo credited viene fatto refetch; l’effect che dipende da `unitsData.balance` si riesegue quando il refetch completa. |
| 4 | Effect “balance change” | M1UPill.tsx:194–211 | Reagisce a `[unitsData?.balance, prevBalance, isAnimating, animateBalance]`; se `!animatingRef.current && !isAnimating && diff >= 5 && diff < 1000` chiama `animateBalance(prevBalance, unitsData.balance, 1500)`. |
| 5 | RAF loop in `animateBalance` | M1UPill.tsx:102–123 `animate` | Callback `requestAnimationFrame`; se `progress` non arriva a 1 (bug durata/calcolo) il loop non termina. |
| 6 | Hard-stop timeout | M1UPill.tsx:98–101 | `setTimeout(forceStopAnimation, HARD_STOP_MS)`; se non viene eseguito (unmount prima, clear errato) l’animazione non viene forzata a stop. |
| 7 | Cleanup unmount | M1UPill.tsx:214–220 | Cancella RAF e timeout; se l’istanza overlay unmounta mentre l’animazione è in corso, solo quella istanza fa cleanup; l’istanza Home continua. |
| 8 | `buzzAreaCreated` / `buzzClueCreated` | M1UPill.tsx:113–114, 119–120 | Chiamano `handleRefresh` → `refetch()`; stesso effetto di (2). |

---

## 2. Ipotesi top-3 con probabilità

| Priorità | Ipotesi | Probabilità | Punti da verificare con i log |
|----------|---------|-------------|-------------------------------|
| 1 | **Due istanze pill (Home + overlay Shop)** ricevono entrambe `m1u-credited`; l’overlay unmounta ma l’istanza **Home** continua ad animare e l’effect “balance change” (dopo refetch) riavvia una seconda animazione perché `prevBalance`/`unitsData` si aggiornano in race. | Alta | Quanti `[M1UPill][mount]` con id diversi; quante volte `handleM1UCredited` e `animateBalance:start` per id; se `balanceEffect willAnimate=true` dopo il primo credited. |
| 2 | **Effect “balance change”** viene rieseguito dopo `refetch()` (o realtime) e con `animatingRef`/`isAnimating` già false (o in race) chiama `animateBalance` di nuovo. | Media | Log `[balanceEffect]` con `willAnimate=true` e `reason`; quante volte `animateBalance:start` e da quale id. |
| 3 | **RAF non termina** (duration 0, progress non arriva a 1, o eccezione) quindi `animatingRef` non viene mai messo a false e l’animazione non ha “complete” né force-stop percepito. | Bassa | Presenza di `animateBalance:complete` o `forceStop`; log `[animateBalance:raf]` a 500 ms per vedere se continua oltre 3.2 s. |

---

## 3. Punti precisi dove piazzare i log

| Punto | File:riga (circa) | Cosa loggare |
|-------|-------------------|--------------|
| Mount | M1UPill.tsx, inizio componente (dopo refs) | `instanceIdRef`, route se disponibile (es. window.location.pathname). |
| Unmount | M1UPill.tsx, cleanup effect (return del useEffect senza deps) | `instanceId`, “unmount”, e che si cancellano RAF + timeout. |
| Listener `m1u-credited` | handleM1UCredited, prima del return/avvio animazione | id, amount, animatingRef.current, displayedBalanceRef.current, unitsData?.balance; stack light (Error().stack slice 0,6). |
| Listener `m1u-balance-changed` / handleRefresh | handleRefresh e addEventListener m1u-balance-changed | id, source (balanceChanged / buzzArea / buzzClue). |
| `animateBalance` inizio | prima di `setIsAnimating(true)` | id, start, target, duration, animatingRef prima. |
| `animateBalance` RAF tick | dentro `animate`, throttled 500 ms | id, “raf”, progress, elapsed (solo se `Date.now()-lastTickLogRef > 500`). |
| `animateBalance` complete | ramo `progress >= 1` | id, “complete”, final value. |
| `forceStopAnimation` | inizio funzione | id, “forceStop”, reason=HARD_STOP_MS. |
| Chiamate a `refetch()` | prima di ogni `refetch()` | id, source (credited | balanceChanged | buzzArea | buzzClue | manual). |
| Effect balance | inizio effect (dopo guard animatingRef) | id, prevBalance, unitsData.balance, animatingRef, isAnimating, willAnimate (true/false), reason breve. |

---

## 4. Istanze pill montate contemporaneamente

- **Home:** il pill è renderizzato in `AppHome.tsx` (overlay fisso).
- **Overlay Shop:** in `M1UShopContent.tsx` viene renderizzato un secondo `<M1UPill />` in overlay per 2.8 s dopo acquisto.
- Quindi al momento del dispatch `m1u-credited` possono essere montate **due** istanze; entrambe ricevono l’evento e possono avviare `animateBalance`. All’unmount dell’overlay resta solo l’istanza Home.
