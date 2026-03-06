# M1U Slot Loop — FASE 2 Logs + Root Cause + Fix

**Data:** 2026-03-05

---

## Root cause (da log Xcode)

1. **Due istanze pill** — Home (`pill-1772689159184-7u17zde`) e overlay Shop (`pill-1772689188799-cgcg9js`) sono montate insieme; entrambe ricevono lo stesso evento `m1u-credited` (e lo stesso refetch / `m1u-balance-changed`).

2. **`m1u-credited` dispatchato più volte** — Per un singolo acquisto l’evento arriva ripetutamente a entrambe le pill. Dopo che un’animazione termina (`animatingRef=false`), un altro `m1u-credited` (duplicato) fa ripartire `animateBalance` (es. 9584593 → 9584643).

3. **Ping-pong con balanceEffect** — L’animazione porta il valore mostrato a 9584643, mentre il balance reale (da refetch/realtime) è 9584593. L’effect vede `prevBalance=9584643` e `newBalance=9584593` e avvia `animateBalance(9584643, 9584593)` (animazione “giù”). A fine animazione, un altro `m1u-credited` duplicato riavvia l’animazione “su”, e il ciclo si ripete → **loop infinito**.

4. **Refetch in cascata** — Ogni pill ha un listener `m1u-balance-changed` che chiama `refetch()`; i refetch si susseguono e l’effect su `unitsData.balance` continua a rieseguirsi, contribuendo al ping-pong.

---

## Fix applicato (solo `M1UPill.tsx`)

- **Cooldown su `m1u-credited`:** `lastCreditAtRef` + `CREDIT_COOLDOWN_MS = 4000`. Se `Date.now() - lastCreditAtRef < 4000` il handler ritorna senza avviare animazione. Evita che i duplicati dello stesso accredito riavviino l’animazione.

- **balanceEffect: niente animazione quando il balance “scende”:** Se `unitsData.balance < prevBalance` si aggiornano solo `displayedBalance` e `prevBalance` (nessuna chiamata a `animateBalance`). Si anima solo quando `newBalance > prevBalance`. Così non si crea più il ping-pong su/giù.

- **Debug:** Tutti i log sono dietro `DEBUG_M1U_PILL`; con `DEBUG_M1U_PILL = false` non viene emesso nulla (FASE 4 cleanup).

---

## Conclusione

**Root cause certa:** duplicati di `m1u-credited` + due istanze pill + balanceEffect che animava anche in discesa (correzione verso il valore reale), con effetto ping-pong e loop infinito.

**Rollback:** `git reset --hard safety/m1u-slotloop-debug-pre-20260305-0618`
