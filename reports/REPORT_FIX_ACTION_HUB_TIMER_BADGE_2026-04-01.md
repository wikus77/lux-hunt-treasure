# REPORT FIX — ACTION HUB + TIMER BADGE

**Data:** 2026-04-01 · Scope: `ActionRadialHubPill.tsx`, `FloatingTimeRingPillV3.tsx` only.

---

## 1. FORENSICS SUMMARY

**Action radial** — I satelliti usavano `RADIAL_4` a **croce** (raggio 70px: destra/sinistra/sopra/sotto) con `SAT_SIZE = 52`, icone `h-5 w-5`, label `text-[8px]`. Sul play surface in alto a sinistra l’apertura a 4 punte andava verso l’interno schermo in modo simmetrico, non come **fascio verso destra**; testo e hit target piccoli.

**Timer** — Il badge `badge` (giorni / stato) era in `span` assoluto con `text-[7px]`, `px-1 py-0.5`, `max-w-[54px]` → poco leggibile su iPhone.

**Root cause** — Layout radiale generico + dimensioni conservative; nessun bug di logica.

---

## 2. FILE ANALIZZATI

- `ActionRadialHubPill.tsx` — `RADIAL_4`, `SAT_SIZE`, stage 200×200, `leftRailRadialSatelliteBiasXPx`
- `FloatingTimeRingPillV3.tsx` — badge overlay, pill 96×96 / ring 72

---

## 3. FILE TOCCATI

| File | Modifica |
|------|-----------|
| `ActionRadialHubPill.tsx` | Posizioni solo a destra; `SAT_SIZE` 64; stage 248×216; icone h-6 w-6; label 9px |
| `FloatingTimeRingPillV3.tsx` | Badge più grande (padding, font 9px, bordo/contrasto) |

---

## 4. FIX APPLICATI

- **Verso destra:** coordinate con **x sempre positivo** (58–76px) e **y** distribuito (−60 … +60) per colonna/ventaglio a destra del centro hub.
- **Satelliti più grandi:** diametro 64px, icone Lucide 24px, label `text-[9px]` extrabold.
- **Stage:** 248×216 per evitare clipping con offset maggiori.
- **Timer badge:** `text-[9px]`, `px-2 py-1`, `max-w-[76px]`, bordo e ombre più forti.

Callback `onSlotTap`, `navigate`, `openMission` **invariati**.

---

## 5. TEST ESEGUITI

- `npm run build` — OK

---

## 6. RISCHI RESIDUI

- Su schermi strettissimi `leftRailRadialSatelliteBiasXPx` può avvicinare ancora i satelliti al bordo; mitigazione già nel hook.

---

## 7. GO / NO GO

- **GO** per obiettivi UI richiesti; verifica finale consigliata su iPhone (play surface aperta).

---

## 8. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
