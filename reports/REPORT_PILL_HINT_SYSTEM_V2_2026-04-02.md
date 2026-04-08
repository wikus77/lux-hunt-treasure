# REPORT — Pill Hint System V2

**Data:** 2026-04-02

---

## 1. DIFFERENZA PRIMA / DOPO

| Aspetto | Prima (`PillInfoOverlay` inline) | Dopo (Pill Hint System V2) |
|--------|-----------------------------------|----------------------------|
| Sequenza | Linea + box quasi insieme, poco staging | **Onda** → **linea curva disegnata** → **box ritardata** → **accenti orizzontale/diagonale** |
| Linea | Segmento retto `motion.line` | **Path SVG quadratico** `M … Q …` + `strokeDasharray` / `strokeDashoffset` + `getTotalLength()` |
| Box | Glass generico, animazione singola | **Mood M1SSION fisso** (`rgba(10,10,30,0.85)`, blur 12px, bordo cyan, glow 20px, raggio 20px, padding 16×20) + entrata `opacity/scale/y` con `cubic-bezier(0.22,1,0.36,1)` |
| Switch pill | Key su contenuto, exit minimo | **`AnimatePresence mode="wait"`** + exit ~0.2s `opacity` + `scale` prima della nuova sequenza |
| Architettura | Tutto in un file | Moduli dedicati sotto `pillHints/` + `PillInfoOverlay` re-export |

**Invariato:** `PillInfoOverlayContext`, `data-pill-info-anchor`, `FloatingPillLayerV3` (nessuna modifica), play surface, `PILL_INFO_OVERLAY_Z_INDEX`, chiusura tap fuori.

---

## 2. ANIMAZIONI IMPLEMENTATE

1. **Radius (onda)** — cerchio al centro pill: `scale` 0 → 1.4, `opacity` keyframes `[0, 0.2, 0]` con `times` `[0, 0.35, 1]`, durata **600ms**, scale con ease-out.
2. **Linea principale** — `strokeDashoffset` da lunghezza path → 0, durata **0.4s**, delay **80ms**, ease **ease-out** `[0,0,0.2,1]`; glow SVG filter.
3. **Box** — delay **0.25s** dall’inizio linea (`lineDelay + 0.25`), durata **0.35s**, `opacity` 0→1, `scale` 0.9→1, `y` 10→0, ease **cubic-bezier(0.22, 1, 0.36, 1)**.
4. **Linee secondarie** — orizzontale + diagonale (simulazione `::before` / `::after`): `scaleX` 0→1 con delay cumulativo (**+0.2s** dopo l’inizio box, più 50ms sulla diagonale).

**Riduzione movimento:** `useReducedMotion()` accorcia le durate e disattiva onda/ritardi pesanti.

---

## 3. FILE CREATI

| File | Ruolo |
|------|--------|
| `src/components/home/pillHints/PillHintOverlayV2.tsx` | Portal, layout, `AnimatePresence`, onda, SVG defs, composizione |
| `src/components/home/pillHints/PillHintConnector.tsx` | `motion.path` + dash draw |
| `src/components/home/pillHints/PillHintBox.tsx` | Box glass + due accenti animati |
| `src/components/home/pillHints/usePillHintAnimation.ts` | Costanti timing + config derivata |
| `src/components/home/pillHints/layoutGeometry.ts` | `computeHintLayout`, `buildConnectorPathD`, accenti per pill |
| `src/components/home/pillHints/index.ts` | Export pubblici |

**Modificato:** `src/components/home/floatingPillsV3/PillInfoOverlay.tsx` → `export { PillHintOverlayV2 as PillInfoOverlay }`.

---

## 4. LOGICA CONNECTOR

- Anchor: `getBoundingClientRect()` sul `[data-pill-info-anchor]` (invariato).
- Punto sul box: bordo superiore o inferiore del pannello (come prima, in base al posizionamento sopra/sotto il pill).
- Path: `M x1 y1 Q cx cy x2 y2` con control point sulla normale a metà segmento (curvatura leggera).
- Lunghezza tratto: `measurePathLengthD(d)` via path temporaneo nel DOM + `getTotalLength()` (calcolo sincrono in `useMemo` su `pathD`).

---

## 5. UX RISULTATO

- Tap pill → impulso visivo al centro → linea che si disegna verso il box → box che “sale” con easing premium → rifiniture orizzontale/diagonale.
- Cambio pill → uscita breve del blocco precedente, poi nuova sequenza completa (niente sovrapposizione brusca).
- Tap fuori / logica esistente sui pill invariata.

---

## 6. RISCHI

- `measurePathLengthD` manipola il DOM durante il render (dentro `useMemo`): necessario per evitare frame vuoti; impatto limitato a un path temporaneo; in **Strict Mode** doppia invocazione in dev è possibile ma innocua.
- Exit con `scale` sul wrapper full-screen può leggermente comprimere l’intero hint; se in QA risulta fastidioso si può restringere lo scale a un sotto-contenitore.

---

## 7. GO / NO GO

- **GO:** Sistema V2 integrato senza toccare `FloatingPillLayerV3` né il contesto pill.
- **GO:** Build produzione OK (`npm run build`).
- **GO:** Pronto per verifica su iPhone dopo `npm run cap:ios:incremental`.

---

## 8. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
