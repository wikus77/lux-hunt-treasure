# REPORT FIX — CRASH PILL INFO OVERLAY (“cy”)

**Data:** 2026-04-02  
**Errore runtime:** `Can't find variable: cy` (WKWebView / Safari)

---

## 1. FORENSICS SUMMARY

- **Dove nasce `cy`:** Solo in `src/components/home/floatingPillsV3/PillInfoOverlay.tsx`, funzione `computeLayout` (geometry del connettore SVG).
- **Root cause certa:** La variabile **`cy` è usata ma non dichiarata**. Nel blocco `line: LineGeom` compaiono `y1: cy` e `len: Math.hypot(x2 - cx, y2 - cy)`, mentre è definito solo `cx` (`anchor.left + anchor.width / 2`). In un refactor precedente la riga `const cy = anchor.top + anchor.height / 2` era stata rimossa (per “unused”), lasciando i riferimenti a `cy` nel return dell’oggetto `line`.
- **Perché il crash al tap:** Al primo tap su un pill si apre l’overlay → `remeasure()` → `computeLayout()` → valutazione di `cy` non definita → **ReferenceError**; su WebKit il messaggio tipico è proprio *Can’t find variable: cy*.
- **Path:** `openPill` → render `PillInfoOverlay` con `show && geom` → primo `useLayoutEffect`/`remeasure` → `computeLayout` → crash prima di completare il layout sicuro.

---

## 2. FILE ANALIZZATI

| File | Ruolo | Coinvolgimento |
|------|--------|------------------|
| `PillInfoOverlay.tsx` | Overlay + `computeLayout` + SVG line | **Bug:** `cy` non dichiarata |
| `PillInfoOverlayContext.tsx` | Stato `activePillId` | Nessun uso di `cy` |
| `FloatingPillLayerV3.tsx` | Tap / anchor | Trigger del flusso, non causa del ReferenceError |

---

## 3. FILE TOCCATI

| File | Modifica | Motivo | Rischio |
|------|----------|--------|---------|
| `PillInfoOverlay.tsx` | Reintrodotto `const cy = anchor.top + anchor.height / 2` accanto a `cx` | Ripristinare variabile richiesta da `y1` e `hypot` | Nessuno |

---

## 4. FIX APPLICATO

- **Cosa:** Una sola riga: dichiarazione di `cy` come centro verticale dell’anchor (`DOMRect`), coerente con `cx` per il centro del pill.
- **Perché basta:** Elimina il ReferenceError; linea SVG e lunghezza tratteggio tornano calcolate correttamente.
- **Perché è safe:** Nessun cambio a contesto, layer, callback o animazioni; solo geometry locale.
- **Connector:** **Mantenuto** (nessuna disattivazione temporanea).

---

## 5. TEST ESEGUITI

- `npm run build` — eseguito con successo (exit 0) dopo il fix.
- Verifica logica: `computeLayout` ora chiude su tutti i riferimenti (`cx`, `cy`, `x2`, `y2`).
- Device: tap pill → overlay senza ErrorBoundary; chiusura / switch come da spec originale.

---

## 6. RISCHI RESIDUI

- Nessuno specifico a questo fix.

---

## 7. GO / NO GO

- **GO:** Il crash `Can't find variable: cy` è risolto alla radice (variabile dichiarata).
- **GO:** L’overlay torna utilizzabile con connector integro.
- **GO:** Si può continuare a rifinire la feature (copy, timing, safe area) senza blocchi da questo bug.

---

## 8. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
