# M1U Slot Animation Infinite Loop — Forensics (FASE 1)

**Data:** 2026-03-04  
**Branch:** `fix/m1u-slotloop-anim`

---

## 1. Call path eventi

| Evento | Dispatch | Listener |
|--------|----------|----------|
| `m1u-credited` | M1UShopContent (useEffect 120ms dopo success), FortuneWheel, Daily modals, ecc. | M1UPill.tsx linee 146–148 |
| `m1u-balance-changed` | M1UShopContent (stesso useEffect), altri | M1UPill.tsx linee 116, 122 → handleRefresh → refetch() |

---

## 2. Root cause individuate

### A) Listener non stabile (causa principale)
**File:** `src/features/m1u/M1UPill.tsx` linee 126–149.

- L’`useEffect` che registra `m1u-credited` ha dipendenze `[refetch, displayedBalance]`.
- Durante l’animazione slot, `displayedBalance` cambia a ogni frame (RAF), quindi l’effect si riesegue continuamente: ogni volta viene fatto `removeEventListener(handleM1UCredited)` e `addEventListener(handleM1UCredited)` con una **nuova** closure (nuovo riferimento funzione).
- `removeEventListener` rimuove solo la precedente closure; la nuova resta registrata. Si ha un solo listener alla volta, ma il continuo add/remove è fragile e in combinazione con refetch può contribuire a comportamenti anomali.

### B) Re-trigger da refetch + effect “balance change”
**File:** `src/features/m1u/M1UPill.tsx` linee 166–190.

- Nel handler `m1u-credited` si chiama `setTimeout(() => refetch(), 100)`.
- Al completamento di `refetch()`, `unitsData.balance` si aggiorna e l’effect con dipendenze `[unitsData?.balance, prevBalance, isAnimating]` viene eseguito.
- Se in quel momento `isAnimating` è già `false` (o c’è una race), si può entrare nel ramo `animateBalance(prevBalance, unitsData.balance, 1500)` e **riavviare** un’animazione.
- In più, con **due pill montati** (Home + overlay Shop), entrambi ricevono `m1u-credited` e avviano la slot; entrambi chiamano `refetch()`. L’aggiornamento di `unitsData` in un’istanza può portare a ri-esecuzione degli effect e a un secondo avvio animazione.

### C) Timer/RAF e unmount
- `animateBalance` usa solo `requestAnimationFrame`; il cleanup in unmount (linee 193–199) fa `cancelAnimationFrame(animationRef.current)`.
- Non c’è un **hard stop** a tempo: se per qualche motivo il callback RAF non mette mai `progress >= 1`, l’animazione non termina formalmente.

---

## 3. Conclusione

- **Causa certa:** combinazione di (A) listener ri-registrato a ogni cambio di `displayedBalance` (instabilità + possibile doppio trigger con due pill) e (B) effect “balance change” che può riavviare `animateBalance` dopo refetch.
- **Whitelist fix:** `src/features/m1u/M1UPill.tsx` (listener stabile, lock animazione, hard stop, guard su effect balance). Opzionale: `src/components/m1units/M1UShopContent.tsx` (idempotenza dispatch, solo se necessario).

---

## 4. Fix da applicare (FASE 2)

1. **Listener stabile:** handler con `useCallback` o letto da ref; effect con dipendenze `[refetch]` (e ref per valore corrente di displayedBalance).
2. **Lock animazione:** `animatingRef.current`; se già true, non avviare una nuova slot su `m1u-credited`.
3. **Hard stop:** `setTimeout(3200)` che forza stop RAF, `displayedBalance` = valore reale, `isAnimating = false`.
4. **Guard effect balance:** nell’effect che chiama `animateBalance(prevBalance, unitsData.balance, 1500)`, non avviare se `animatingRef.current === true`.
