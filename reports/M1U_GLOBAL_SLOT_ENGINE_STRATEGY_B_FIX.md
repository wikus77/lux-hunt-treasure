# M1U Global Slot Engine — Strategia B (“Single Visual Authority”) — Fix report

**Data:** 2026-03-05  
**Scope:** iOS Capacitor WKWebView only. NO IAP / accredito / StoreKit / BUZZ / login / push / subscriptions modificati.

---

## 1. Root cause sintetica

- **Problema:** Dopo IAP (e altri crediti M1U), il “M1U Global Slot Engine” montava un **secondo** `M1UPill` in overlay globale. Se la pagina corrente (es. Home) aveva già il suo pill, l’utente vedeva **due pill** (duplicazione visiva).
- **Causa:** `GlobalM1UCreditOverlay` ascoltava `m1u-credit-event` e, oltre a propagare gli eventi, **renderizzava** un secondo `M1UPill` in un `motion.div` fixed (z-index 99999), invece di far animare solo il pill già presente in pagina.

---

## 2. File modificati

| File | Modifica |
|------|----------|
| **`src/features/m1u/GlobalM1UCreditOverlay.tsx`** | Componente reso **headless**: rimosso il render di `<M1UPill />` e del `motion.div` overlay; mantenuti listener a `m1u-credit-event`, dedupe per `detail.id`, lock `animatingRef`, timeout 120 ms (dispatch `m1u-credited` e `m1u-balance-changed`), timeout 2800 ms (reset stato). Il componente ora fa solo `return null`. Rimossi import non usati: `useState`, `motion`, `AnimatePresence`, `M1UPill`. |

**Nessun altro file modificato.**  
Non toccati: `m1uCreditEvent.ts`, `M1UPill.tsx`, `M1UShopContent.tsx`, `App.tsx`, IAP, accredito, StoreKit, Supabase, BUZZ, login, push, subscriptions.

---

## 3. Conferma: GlobalM1UCreditOverlay è ora headless

- **Sì.** Il componente:
  - continua ad ascoltare `m1u-credit-event`;
  - mantiene dedupe (`lastCreditIdRef`), lock (`animatingRef`) e i due timeout (120 ms dispatch, 2800 ms reset);
  - **non** monta più alcun nodo DOM: `return null`;
  - non usa più `M1UPill`, `motion`, `AnimatePresence` né state `visible`/`amount` per la UI.

Il “motore” globale resta quindi solo un **propagatore di eventi**: su credito M1U da qualsiasi sorgente (shop, wheel, mission, ecc.) viene ancora emesso `m1u-credit-event`; `GlobalM1UCreditOverlay` dopo 120 ms dispatcha `m1u-credited` e `m1u-balance-changed`. Il pill già presente nella pagina (es. Home, Buzz, Intelligence) riceve questi eventi e anima (PRE → SLOT → POST), senza alcun secondo pill in overlay.

---

## 4. Conferma “NO TOUCH IAP”

- **IAP / StoreKit / receipt / verify / credit logic:** non modificati.
- **Supabase / accredito:** non modificati.
- **M1UShopContent:** non modificato (continua a chiamare `emitM1UCreditEvent(amount, 'shop')` dopo payment success).
- **m1uCreditEvent.ts:** non modificato (`emitM1UCreditEvent`, `window.__m1u_pending_credit__`, payload invariati).
- **M1UPill.tsx:** non modificato (logica animazione, lock, listener `m1u-credited` / `m1u-balance-changed` invariata).

Modifiche ammesse e effettuate: **solo** `GlobalM1UCreditOverlay.tsx` (UI/event system).

---

## 5. FASE 0 — Safety / rollback

- **Branch:** `fix/m1u-slotloop-anim`
- **Commit (pre-patch):** `aca569c00 feat(welcome-bonus): 500→150 M1U + i18n WelcomeBonusModal (en/it/fr)`
- **Tag creato:** `safety/m1u-global-slot-strategy-b-pre-fix-20260305-1620`

**Comando rollback (ripristina stato pre-fix):**

```bash
git reset --hard safety/m1u-global-slot-strategy-b-pre-fix-20260305-1620
```

*(Nota: il working tree non era pulito; il tag punta al commit sopra. Per annullare solo questa patch mantenendo il resto: `git checkout -- src/features/m1u/GlobalM1UCreditOverlay.tsx`.)*

---

## 6. FASE 1 — Verifica pre-patch (confermata)

1. **GlobalM1UCreditOverlay** (pre-fix): ascoltava `m1u-credit-event`, impostava `setVisible(true)`, renderizzava `<M1UPill />` quando `visible === true`, timeout 120 ms → dispatch `m1u-credited` e `m1u-balance-changed`, timeout 2800 ms → hide. **Confermato.**
2. **AppHome** (e altre pagine) hanno già un proprio `M1UPill` (es. Home in `#m1u-pill-home-slot`). **Confermato.**
3. La duplicazione visiva dipendeva dal fatto che overlay + pill di pagina erano entrambi montati. **Confermato.**

---

## 7. FASE 3 — Esito test iPhone (da eseguire da te)

Test da eseguire su iPhone / iOS wrapper:

1. **Home con pill visibile → acquisto IAP sandbox**  
   - Atteso: nessun pill duplicato; solo il pill della Home anima (PRE → SLOT → POST).
2. **Nessun crash, nessun overlay residuale, nessuna regressione UI nel modale shop.**
3. **Altra sorgente M1U (es. wheel o daily mission)** da una pagina con pill visibile: atteso nessun pill duplicato, solo il pill già in pagina anima.

**Smoke test paletti (da verificare):** login/logout OK, delete-account OK, IAP OK, BUZZ OK, BUZZ MAP OK, push native OK.

*(Inserire qui l’esito dopo i test su dispositivo.)*

---

## 8. FASE 4 — Build e cap sync

| Comando | Esito |
|---------|--------|
| `npm run build` | **OK** (exit 0, built in ~43s) |
| `npx cap sync ios` | **OK** (exit 0, sync in ~8.5s) |

---

## 9. Riepilogo

- **Strategia B applicata:** overlay globale non renderizza più un secondo pill; il motore propaga solo gli eventi; il pill già presente in pagina è l’unica autorità visiva e anima su `m1u-credited` / `m1u-balance-changed`.
- **File toccato:** solo `src/features/m1u/GlobalM1UCreditOverlay.tsx`.
- **Paletti rispettati:** nessuna modifica a IAP, accredito, StoreKit, Supabase, BUZZ, login, push, subscriptions.
- **Rollback:** `git reset --hard safety/m1u-global-slot-strategy-b-pre-fix-20260305-1620`.

---

**Fine report.**
