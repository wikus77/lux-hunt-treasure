# M1U Pill — Fix “POST-first” (mostra PRE → slot → POST)

**Data:** 2026-03-05  
**Scope:** iOS Capacitor WKWebView — solo UI/animazione. **NO IAP TOUCH.**

---

## Root cause

- Dopo acquisto IAP, Supabase Realtime aggiorna `unitsData.balance` al valore **POST** (es. 160) **prima** del dispatch di `m1u-credited` (ritardo 120 ms).
- Gli effect di sync in `M1UPill.tsx` (ex 328–335 e 338–352) impostavano subito `displayedBalance = unitsData.balance` quando non in animazione → l’utente vedeva prima il **POST** (160).
- A T0+120 ms arrivava `m1u-credited` e la pill animava 50→160, ma il primo frame era già 160.

Riferimento: `reports/M1U_PILL_POST_FIRST_FORENSICS.md`.

---

## Soluzione: “pending credit snapshot” globale

1. **Shop:** alla payment success (prima del dispatch a 120 ms) si scrive su `window.__m1u_pending_credit__` un snapshot in-memory: `{ amount, issuedAt, source: 'shop', id }`. TTL 5 s gestito in pill.
2. **Pill:** gli effect di sync diventano **pending-aware**: se esiste un pending valido (non scaduto, amount > 0), **non** si imposta `displayedBalance = unitsData.balance` (POST), ma `displayedBalance = pre = Math.max(0, unitsData.balance - pending.amount)` (PRE).
3. All’arrivo di `m1u-credited(amount)` la pill consuma il pending (clear) e anima da PRE a POST come già fatto; dopo TTL (5 s) senza evento, `readPendingCredit` restituisce null e la pill torna a sync normale (mostra POST).

---

## File e linee modificate

### 1. `src/components/m1units/M1UShopContent.tsx`

- **handlePaymentSuccess:** subito dopo `setOverlayAmount(amount)` e `setShowM1UPillOverlay(true)`, scrittura di `window.__m1u_pending_credit__` con `{ amount, issuedAt: Date.now(), source: 'shop', id: \`shop-${Date.now()}-${random}\` }`.
- Nessun altro cambiamento; dispatch `m1u-credited` e `m1u-balance-changed` restano dopo 120 ms.

### 2. `src/features/m1u/M1UPill.tsx`

- **Costanti e helper (top):**
  - `PENDING_CREDIT_KEY`, `PENDING_CREDIT_TTL_MS` (5000).
  - `interface PendingCredit`, `readPendingCredit(win)` (legge e valida TTL/amount; se scaduto rimuove la key), `clearPendingCredit(win)`.
- **Effect “Initialize displayed balance when data loads” (ex 328–335):**
  - Se `readPendingCredit(win)` valido e `unitsData.balance` number → `pre = Math.max(0, unitsData.balance - pending.amount)`; se `displayedBalance !== pre` → `setDisplayedBalance(pre)`, `setPrevBalance(pre)`; return.
  - Altrimenti comportamento invariato: sync `displayedBalance = unitsData.balance`.
- **Effect “FIX2 balance” (ex 338–352):**
  - Stessa logica pending-aware: se pending valido → sync a `pre`; altrimenti init/sync come prima (prevBalance null o `unitsData.balance !== prevBalance`).
- **handleM1UCredited:**
  - Dopo aver calcolato fromBalance/targetBalance, se `readPendingCredit(win)` valido e `pending.amount === amount` → `clearPendingCredit(win)`.
  - Resto invariato (lock, animate, refetch).

---

## Rollback

Tag creato **prima** delle modifiche:

```bash
git reset --hard safety/m1u-pill-postfirst-pre-fix-20260305-1200
```

- **Tag:** `safety/m1u-pill-postfirst-pre-fix-20260305-1200`  
- **Commit:** `aca569c0089e90adcb76a008e375ca6812ef8349`

---

## Test iOS (obbligatorio)

**Scenario:** saldo pre noto (es. 50), acquisto +110.

**Atteso:**

1. Appena la pill è visibile dopo il purchase: mostra **50** (non 160).
2. Parte animazione slot 50 → 160.
3. Stop corretto a 160.
4. Nessun frame iniziale a 160 prima della slot.

**Log/screenshot:** con `DEBUG_M1U_PILL = true` in `M1UPill.tsx` (solo per test) si possono raccogliere in Xcode i log di `handleM1UCredited:start` / `preAnim` e verificare `computedFromBalance=50`, `computedTargetBalance=160`. Dopo validazione impostare di nuovo `DEBUG_M1U_PILL = false`.

---

## Build e sync

- `npm run build` — OK (prebuild guard passed, vite build completato).
- `npx cap sync ios` — OK (assets in `ios/App/App/public`, plugin aggiornati).

---

## Vincoli rispettati

- Nessuna modifica a IAP / StoreKit / receipt / logica accredito.
- Modifiche solo in `M1UShopContent.tsx` e `M1UPill.tsx`.
- BUZZ, BUZZ MAP, login/logout, delete-account, push, subscriptions non toccati.
- Rollback documentato con tag safety.

---

*© 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™*
