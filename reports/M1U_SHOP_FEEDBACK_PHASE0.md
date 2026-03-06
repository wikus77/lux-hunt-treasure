# M1U SHOP FEEDBACK — FASE 0 (Verifica forense pre-patch)

**Data:** 2026-03-04  
**Branch:** `fix/m1u-shop-feedback-pill` | **Tag rollback:** `safety/m1u-shop-feedback-pre`

---

## 1. Pill M1U e animazione slot

| Dove | Dettaglio |
|------|-----------|
| **Componente** | `src/features/m1u/M1UPill.tsx` |
| **Listener** | `window.addEventListener('m1u-credited', handleM1UCredited)` (linee 146–148) |
| **Evento atteso** | `new CustomEvent('m1u-credited', { detail: { amount } })` |
| **Comportamento** | All’evento: `animateBalance(currentDisplayed, newBalance, 2500)` (slot 2.5s) + `refetch()` |
| **Export** | `export default M1UPill` — riutilizzabile con import diretto |

---

## 2. Modale Shop M1U

| File | Ruolo |
|------|--------|
| `src/components/m1units/M1UnitsShopModal.tsx` | Wrapper: `M1UShopFlipOverlay` → `M1UShopContent` |
| `src/components/m1units/M1UShopContent.tsx` | Contenuto shop: pack, `handlePurchase` → `M1UPaymentModal`, `handlePaymentSuccess` |
| `src/components/m1units/M1UPaymentModal.tsx` | Modale pagamento; onSuccess → `handlePaymentSuccess` del parent |

Apertura: da **M1UPill** (click “+”) → `M1UnitsShopModal`; da **ShopContent** (tab Shop) → stesso `M1UnitsShopModal` con `M1UShopContent`.

---

## 3. Punto success acquisto e dispatch

| Dove | Cosa succede |
|------|--------------|
| **File** | `src/components/m1units/M1UShopContent.tsx` |
| **Funzione** | `handlePaymentSuccess()` (linee 109–131) |
| **Già dispatch** | Sì: `window.dispatchEvent(new CustomEvent('m1u-credited', { detail: { amount: selectedPack.m1u_total, ... } }))` |
| **Problema UX** | Subito dopo viene chiamato `onClose()`: il modale si chiude e l’utente non vede il pill (sotto il modale o fuori vista) né percepisce bene l’animazione slot. |

Quindi la causa non è la mancanza di evento, ma la chiusura immediata del modale e l’assenza di un overlay del pill **dentro** il modale.

---

## 4. Strategia scelta (minima e sicura)

1. **Dispatch**  
   Mantenere il dispatch `m1u-credited` con `amount` (già presente).  
   Ritardare `onClose()` di ~2.8s dopo il successo.

2. **Overlay pill nel modale Shop**  
   Solo in `M1UShopContent`:
   - Stato: `showM1UPillOverlay`, `overlayAmount`.
   - Su successo: chiudere solo il payment modal, impostare `overlayAmount = selectedPack.m1u_total`, `showM1UPillOverlay = true`.
   - Dopo ~120 ms (mount overlay): dispatch `m1u-credited` con `overlayAmount` (così il pill nell’overlay riceve l’evento e anima).
   - Dopo 2800 ms: fade-out overlay, poi `onClose()`.

3. **Riuso pill**  
   **Preferenza A:** importare e renderizzare lo stesso `M1UPill` nell’overlay.  
   Overlay: `position: fixed`, z-index alto, `pointer-events: none`, in alto a sinistra (stile pill reale).  
   Transizione: opacity 0 → 1 (200–300 ms), poi 1 → 0 (200–300 ms) alla chiusura (framer-motion o CSS).

4. **Nessuna nuova stringa**  
   Overlay = solo pill visivo; nessuna micro-label aggiunta (zero i18n).

---

## 5. Whitelist file

| File | Modifica |
|------|----------|
| `src/components/m1units/M1UShopContent.tsx` | State overlay, ritardo onClose, dispatch dopo mount, render overlay con M1UPill + fade |
| (opzionale) `src/features/m1u/M1UPill.tsx` | Solo import da M1UShopContent; nessun cambio logica |
| `reports/M1U_SHOP_FEEDBACK_PHASE0.md` | Questo report |
| `reports/M1U_SHOP_FEEDBACK_PHASE1_RESULTS.md` | Report esiti (post FASE 2) |

Nessun cambiamento a: IAP pipeline, credit, M1UPaymentModal, M1UnitsShopModal (solo figlio M1UShopContent).

---

## 6. Rischio FROZEN

- **Nessun impatto** su: login/logout, delete-account, IAP (flusso pagamento/credit invariato), BUZZ, BUZZ MAP, push.
- Modifiche solo UI in `M1UShopContent`: stato overlay, timing di chiusura, render overlay.  
- **Conclusione: OK per procedere con FASE 2.**
