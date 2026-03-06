# M1U Slot Loop Fix2 — FASE 0 Verifica (perché cooldown non basta)

**Data:** 2026-03-05  
**Tag rollback:** `safety/m1u-slotloop-fix2-pre-20260305-1200`

---

## 1. I duplicati `m1u-credited` superano i 4s?

Dai log Xcode (stesso acquisto): gli eventi `m1u-credited` arrivano in rapida successione e **anche a distanza di diversi secondi**. Dopo un `animateBalance:complete`, un altro `m1u-credited` (amount=50) arriva con `animatingRef=false` e riavvia l’animazione. Il cooldown di 4s blocca solo i duplicati **entro** 4s; se la stessa “burst” di eventi si protrae oltre 4s (realtime, refetch, o dispatch ritardati), il primo evento consuma il cooldown e i successivi (dopo 4s) passano e riavviano l’animazione. In più **due istanze** (Home + overlay) hanno ciascuna il proprio `lastCreditAtRef`: la prima può animare, la seconda dopo un attimo riceve lo stesso evento e, se il cooldown è per-istanza, anche la seconda può animare. Quindi il cooldown **non basta** perché: (a) è per-istanza, non globale; (b) eventi ritardati oltre 4s bypassano il cooldown.

---

## 2. Due sorgenti evento + due pill

- **`m1u-credited`** (custom): dispatch da Shop (e possibilmente da altri punti); ricevuto da **entrambe** le pill (Home + overlay).
- **`m1u-balance-changed`** (custom): triggera `refetch()` in **entrambe** le pill → refetch in cascata → `unitsData.balance` si aggiorna più volte → l’effect su `unitsData.balance` si riesegue e (prima del fix2) poteva chiamare `animateBalance` (ping-pong).
- **Realtime subscription** (in `useM1UnitsRealtime`): aggiorna `unitsData` quando il balance cambia su DB → stesso effect si riesegue.
- **Conferma 2 instanceId in contemporanea:** dai log: `pill-1772689159184-7u17zde` (Home) e `pill-1772689188799-cgcg9js` (overlay Shop) entrambi ricevono `m1u-credited` e `refetch:call`; l’overlay fa unmount più tardi (`[M1UPill][unmount] id=pill-1772689188799-cgcg9js`).

---

## 3. Timeline (sintesi dai log)

- **T0:** Mount Home pill → balanceEffect init.
- **T1:** Apertura Shop → mount overlay pill → balanceEffect overlay (prevBalance=null poi 9584543→9584593, willAnimate=true) → **overlay** avvia animateBalance(9584543→9584593, 1500ms).
- **T2:** Purchase complete → dispatch `m1u-credited` (50). **Home** riceve per primo, animatingRef=false → avvia animateBalance(9584543→9584593, 2500ms). **Overlay** riceve subito dopo (animatingRef=true) → ignorato.
- **T3:** Entrambe le pill chiamano refetch (source=credited, source=balanceChanged) → refetch in cascata.
- **T4:** Overlay completa animazione → animatingRef=false. Poco dopo arriva **un altro** `m1u-credited` (duplicato) → **overlay** ora ha animatingRef=false e cooldown potrebbe essere scaduto o l’overlay ha un suo lastCreditAtRef → **riavvia** animateBalance(9584593→9584643).
- **T5:** balanceEffect (su una delle due pill) vede prevBalance=9584643 e newBalance=9584593 → prima del fix “no-down-anim” avviava animate down → ping-pong. Con fix “no-down-anim” non anima più in discesa, ma i **duplicati** `m1u-credited` continuano a far ripartire l’animazione su una delle due istanze.

**Durata tra primo e ultimo duplicato `m1u-credited`:** nei log si vedono molti `[M1UPill][m1u-credited]` in sequenza; l’ultimo arriva ben dopo il primo complete, quindi la “burst” si protrae per **più di 4 secondi** (o le due istanze si alternano e ognuna rispetta il cooldown ma l’altra no).

---

## 4. Chi richiama refetch

- **Home pill:** refetch da `m1u-credited` (setTimeout 100ms), da `m1u-balance-changed`, da buzzAreaCreated, buzzClueCreated, m1u-spent.
- **Overlay pill:** stesso set di listener → **entrambe** chiamano refetch per ogni `m1u-balance-changed` e dopo `m1u-credited`. Quindi ogni evento genera **due** refetch (uno per istanza), con possibile inflight concorrenti e aggiornamenti multipli di `unitsData.balance`.

---

## 5. Conclusione FASE 0

- Il cooldown per-istanza non basta: due istanze e duplicati oltre 4s consentono comunque più avvii di animazione.
- Serve **un solo “autorizzato”** per credit burst (lock globale) e **refetch throttle globale** per ridurre cascate.
- L’effect su `unitsData.balance` non deve più avviare la slot: **solo** `m1u-credited` (con lock) deve avviare l’animazione; l’effect deve solo sincronizzare displayedBalance/prevBalance.
