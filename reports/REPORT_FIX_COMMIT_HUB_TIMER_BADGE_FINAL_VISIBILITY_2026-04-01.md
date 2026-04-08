# REPORT FIX — COMMIT HUB + TIMER BADGE FINAL VISIBILITY

**Data:** 2026-04-01 · Scope: `CommitRadialHubPill.tsx`, `FloatingTimeRingPillV3.tsx` soltanto.

---

## 1. FORENSICS SUMMARY

**Prossima azione (reference):** `ActionRadialHubPill` usa satelliti **64px**, offset solo a **destra** (`x` > 0), colonne sfalsate `(62,±102)` e `(104,±51)`, stage **280×252**, spring 420/28, bias `leftRailRadialSatelliteBiasXPx` sull’asse X.

**Commit (prima):** `RADIAL_7` su **cerchio** (anche con `x` negativi), `SAT_SIZE` **44**, contenitore radiale **200×200** → aspetto diverso, bolle più piccole e più dense.

**Timer badge:** Ancora limitato da `text-[11px]` e area utile modesta rispetto al pill **96×96** — su iPhone restava secondario rispetto al numero centrale.

**Root cause:** Commit non condivideva preset geometrico né dimensione con Action; il badge richiedeva un ulteriore step di scala/contrasto.

---

## 2. FILE ANALIZZATI

- `ActionRadialHubPill.tsx` (solo lettura — preset di riferimento)
- `CommitRadialHubPill.tsx`
- `FloatingTimeRingPillV3.tsx`

---

## 3. FILE TOCCATI

| File | Modifica |
|------|-----------|
| `CommitRadialHubPill.tsx` | Offset allineati a Action + terza colonna destra; SAT 64; stage 380×276; tipografia lettera |
| `FloatingTimeRingPillV3.tsx` | Badge più grande (13px, padding, bordo, contrasto) |

---

## 4. FIX APPLICATI

**Commit come Prossima azione**

- Stessi primi **quattro** offset di `ActionRadialHubPill`; tre slot aggiuntivi su colonna **`x: 152`** con `y: -95, 0, 95` (stesso criterio di distanza ~≥65px tra centri adiacenti con dischi 64px).
- `SAT_SIZE = 64`, `text-2xl font-black` per la lettera.
- Stage **380×276** (embedded + legacy wrapper) per contenere la terza colonna senza clipping rispetto al centro hub.
- **Nessuna** modifica a `onSlotTap`, shuffle, `openCommit`, portal id, z-index config.

**Timer badge**

- `text-[13px]`, `min-h/w` 32px, `px-3 py-2`, `max-w-[118px]`, bordo più marcato, `bg-neutral-950/95`, ombra più forte, `z-20`, posizione `-right-1 -top-1`.

---

## 5. TEST ESEGUITI

- `npm run build` — OK

---

## 6. RISCHI RESIDUI

- Modalità **legacy** (portal top-right): area radiale più larga (380px); su schermi stretti la fan può avvicinarsi al centro schermo — da verificare se quella modalità è ancora in uso in produzione.

---

## 7. GO / NO GO

**GO:** Commit riusa la stessa logica destra / 64px / spacing premium di Prossima azione (con 7 punti e terza colonna); badge timer sensibilmente più leggibile. Smoke su iPhone consigliata.

---

## 8. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
