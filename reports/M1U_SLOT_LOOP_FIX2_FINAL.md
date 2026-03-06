# M1U Slot Loop Fix2 — Report finale

**Data:** 2026-03-05  
**Tag rollback:** `safety/m1u-slotloop-fix2-pre-20260305-1200`  
**File modificato:** `src/features/m1u/M1UPill.tsx` only.

---

## NO TOUCH IAP

- Nessuna modifica a: IAP, purchase/receipt/storekit, credit/accredito, Edge/Supabase, BUZZ, BUZZ MAP, push, login/logout, delete-account, subscriptions.
- Solo UI e event-handling nel pill (lock globale in-memory su `window`, refetch throttle, balance effect).

---

## Cosa è stato cambiato (solo M1UPill.tsx)

### 1. Lock globale credit (MOSSA #1 — dedupe eventi + single authority)

- **Chiave:** `window.__m1u_pill_credit_lock__`
- **Formato:** `{ creditKey: string, expiresAt: number }`
- **Regola:** All’arrivo di `m1u-credited` si calcola `creditKey = "credited|" + amount + "|" + Math.floor(Date.now()/2000)` (finestra 2s). Se esiste già un lock con lo stesso `creditKey` e `Date.now() < expiresAt` → l’istanza **ignora** (non anima). Altrimenti si imposta il lock con `expiresAt = now + HARD_STOP_MS + 800` e **solo quella istanza** procede con l’animazione.
- **Effetto:** Anche con 2 pill (Home + overlay Shop) e molti duplicati `m1u-credited`, l’animazione parte **una sola volta** in tutto l’app.

### 2. Refetch throttle globale (MOSSA #2)

- **Chiave:** `window.__m1u_refetch_lock__`
- **Formato:** `{ lastRefetchAt: number, inflight: boolean }`
- **Regola:** Prima di chiamare `refetch()`: se `Date.now() - lastRefetchAt < 1500` → skip; se `inflight === true` → skip. Altrimenti si imposta `inflight = true`, si chiama `refetch()`, in `finally` si imposta `inflight = false` e `lastRefetchAt = Date.now()`.
- **Effetto:** Riduce refetch in cascata da entrambe le pill e aggiornamenti multipli che ri-triggeravano effect.

### 3. Balance effect: solo sync, mai animate (FASE 3)

- L’effect che reagisce a `unitsData.balance` **non chiama più** `animateBalance`.
- Fa solo: se `animatingRef.current` → return; altrimenti `setDisplayedBalance(unitsData.balance)` e `setPrevBalance(unitsData.balance)` (sync secco).
- **Unica sorgente animazione:** evento `m1u-credited` (dopo aver acquisito il lock).

### 4. Emergency hard stop

- Nella callback RAF di `animateBalance`: se `window[GLOBAL_LOCK_KEY]` esiste e `Date.now() > lock.expiresAt` → si azzera il lock e si chiama `forceStopAnimation()`.
- In `handleM1UCredited`: se il lock esiste ma è scaduto (`now >= expiresAt`) → si azzera prima di decidere se acquisire.

### 5. Strumentazione debug (FASE 1)

- Con `DEBUG_M1U_PILL === true`: log di `m1u-credited` (amount, creditKey, eventTimeStamp, id), `m1u-balance-changed` (creditKey, id), refetch (reason, id, lastRefetchAt, willRefetch).
- In produzione `DEBUG_M1U_PILL = false` → nessun log.

---

## Rollback

```bash
git reset --hard safety/m1u-slotloop-fix2-pre-20260305-1200
```

---

## Test iOS attesi

1. **Un acquisto:** una sola animazione slot, stop entro HARD_STOP_MS (~3.2s), nessun riavvio.
2. **Doppio mount (Home + overlay Shop):** due instanceId presenti, ma **solo una** acquisisce il lock e anima; l’altra ignora i duplicati.
3. **Dopo chiusura modale:** nessuna animazione residua.

---

## Costanti

- `CREDIT_LOCK_WINDOW_MS = 2000` (finestra per creditKey).
- `REFETCH_THROTTLE_MS = 1500`.
- `HARD_STOP_MS = 3200` (invariato).
