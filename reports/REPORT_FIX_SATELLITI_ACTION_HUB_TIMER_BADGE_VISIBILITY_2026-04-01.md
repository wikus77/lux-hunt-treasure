# REPORT FIX — SATELLITI ACTION HUB + TIMER BADGE VISIBILITY

**Data:** 2026-04-01 · Scope: solo `ActionRadialHubPill.tsx`, `FloatingTimeRingPillV3.tsx`.

---

## 1. FORENSICS SUMMARY

**Satelliti:** La distanza era data solo da `RADIAL_4` (`x`,`y` in px da centro hub). Con `SAT_SIZE = 64` (raggio 32), i centri a **40px** di distanza verticale (**−60/−20/20/60**) implicavano **sovrapposizione geometrica** tra coppie adiacenti; in più le colonne a x 58 e 76 erano troppo vicine per un ventaglio “respirabile”.

**Badge timer:** Restava limitato da `text-[9px]`, padding modesto e bordo leggero — su iPhone il contenuto del `badge` restava difficile da leggere a colpo d’occhio.

**Root cause:** offset insufficienti per il diametro fisso dei satelliti; badge ancora sotto-dimensionato rispetto al pill 96×96.

---

## 2. FILE ANALIZZATI

- `ActionRadialHubPill.tsx` — `RADIAL_4`, `SAT_SIZE`, `RADIAL_STAGE_*`, animazione `x`/`y`
- `FloatingTimeRingPillV3.tsx` — overlay `badge` in `<span>` assoluto

---

## 3. FILE TOCCATI

| File | Modifica |
|------|-----------|
| `ActionRadialHubPill.tsx` | Nuovi offset (destra + stagger); stage 280×252 |
| `FloatingTimeRingPillV3.tsx` | Badge più grande: 11px, padding, bordo, contrasto, max-width |

---

## 4. FIX APPLICATI

**Satelliti più distanti**

- Offset aggiornati: colonna esterna `x: 62`, `y: ±102`; colonna interna `x: 104`, `y: ±51` — mantiene apertura a **destra** (`x` > 0), aumenta gap verticale e separazione diagonale (centri ~64px+ dove serviva per evitare overlap tra dischi da 64px).
- `RADIAL_STAGE_W` 248 → **280**, `RADIAL_STAGE_H` 216 → **252** per contenere i nuovi offset senza clipping dello stage interno.

**Badge timer più visibile**

- `text-[11px]`, `px-2.5 py-1.5`, `min-h/min-w` 26px, `max-w-[100px]`, `border-2 border-white/55`, `bg-black/88`, ombra più marcata.

Logica azioni / countdown **invariata**.

---

## 5. TEST ESEGUITI

- `npm run build` — OK

---

## 6. RISCHI RESIDUI

- Con `leftRailRadialSatelliteBiasXPx` positivo i satelliti si spostano ulteriormente a destra: su notch strettissimi verificare che non tocchino il bordo (overflow già `visible` sulla pill).

---

## 7. GO / NO GO

**GO:** composizione più ariosa e geometricamente non sovrapposta tra satelliti adiacenti; badge sensibilmente più leggibile. Verifica consigliata su device iPhone reale.

---

## 8. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
