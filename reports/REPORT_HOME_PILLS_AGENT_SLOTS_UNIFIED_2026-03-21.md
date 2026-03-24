# REPORT — Fix unificato: Agent + slot Prossima azione / Commit (viewport-safe)

**Data:** 2026-03-21  
**Base:** `reports/REPORT_HOME_PILLS_GEOMETRY_UNIFIED_2026-03-21.md`  
**Scope:** solo layout geometrico / apertura satelliti — nessuna logica business, copy, CTA, DCL, Commit/Battle/Agent flow.

---

## 1. FORENSICS SUMMARY

### A) M1SSION Agent non allineato al “buon” asse

| Elemento | Riferimento geometrico |
|----------|-------------------------|
| **Tempo / Battle (corretti)** | Rail destro: `absolute` con `right: max(16px, safe-right)`, `top: safe-top + stackTopOffsetPx`; colonna interna `w-max` + `items-end` + `gap-3`. Ogni pill ha footprint **72×72** (Tempo definito da `SIZE = 72` in `FloatingTimeRingPillV3`). L’allineamento “buono” è il **bordo esterno del cerchio** contro il margine destro + stessa griglia verticale. |
| **Agent (prima del fix)** | Stesso rail sinistro (`items-start`, `gap-3`) ma **solo** un `motion.button` 72×72 **senza** il guscio `72×72 shrink-0` che hanno **Action** e **Commit** (wrapper esterno dedicato). In flex, il bottone era già 72×72; la divergenza percepita nasce soprattutto da **incoerenza di shell** rispetto agli altri due elementi della colonna e da eventuali differenze di **box model** / stacking rispetto al pattern “cella 72 + overflow visible”. |

**Causa strutturale (Agent):** non una logica Agent diversa, ma **footprint/wrapper non speculare** rispetto ad Action/Commit: mancava il **contenitore esplicito 72×72** con `shrink-0 overflow-visible` condiviso con gli altri pill del rail sinistro.

*Escluso (con bassa evidenza nel codice attuale):* `translate` sul pill Agent, z-index, label che alterano la larghezza flex (il badge è `absolute` fuori flusso).

### B) Slot Prossima azione / Commit tagliati

| Aspetto | Diagnosi |
|---------|-----------|
| **Dove nasce il clipping** | I satelliti sono posizionati con **raggio ~70px** da centro hub (`RADIAL_4` / `RADIAL_7`). Il centro coincide con il centro del pill sul **rail sinistro**, quindi a pochi pixel dal bordo sinistro dello schermo (`left ≈ max(16px, safe-left)`). Gli slot con **x negativa** (es. AION **-70**) portano il centro del satellite a **sinistra** del centro del pill di **~70px** + metà diametro (~22–26px) → **oltre il bordo sinistro del viewport** → taglio. Non dipende da `overflow: hidden` sul pill (era già `visible`): è **geometria pura** (spread verso l’esterno a sinistra). |
| **Prossima azione vs Commit** | **Stessa causa** (anello centrato sul pill vicino al bordo sinistro). Commit ha anche offset tipo **-63** / **-68**: stesso ordine di grandezza. |
| **Direzione “ideale”** | **Inward-first:** spostare l’intero pattern satelliti verso il **centro schermo** lungo **X** senza spostare il pill centrale (solo somma su `x` in `animate` Framer). Così non si inverte il lato del rail né si cambiano CTA/ordine slot. |
| **Strategia iPhone-safe senza redesign** | (1) **Bias X unico** da token con commento che lega raggio + half-slot + margine. (2) **`overflow: visible`** esplicito su layer e colonne rail per evitare clipping da contenitori intermedi in WKWebView. |

---

## 2. FIX APPLICATO

### File toccati

| File | Modifica | Perché è safe |
|------|-----------|---------------|
| `useFloatingPillsV3.ts` | Costante documentata `LEFT_RAIL_RADIAL_SATELLITE_BIAS_X_PX = 60` esposta come `leftRailRadialSatelliteBiasXPx`. | Una sola sorgente di verità; valore giustificato da geometria (≈ raggio 70 + metà satellite − margine rispetto al centro pill ~52px da sinistra). |
| `ActionRadialHubPill.tsx` | `useFloatingPillsV3()`; `animate.x = slot.x + leftRailRadialSatelliteBiasXPx`. | Stessi slot, stessi tap, stesse destinazioni; solo traslazione dell’animazione. |
| `CommitRadialHubPill.tsx` | Stesso bias **solo** se `embedInHomeFloatingLayer` (V3); in portal legacy **bias 0**. | Il portal top-right ha già spazio verso sinistra; non si altera il layout legacy. |
| `FloatingAgentPillV3.tsx` | Wrapper `div` `72×72 shrink-0 overflow-visible` attorno al `motion.button` esistente. | Solo struttura; nessun cambio handler, stili del bottone, copy, animazioni interne. |
| `FloatingPillLayerV3.tsx` | `overflow: 'visible'` sul root del portal; `overflow-visible` sulle colonne sinistra e destra. | Non sposta Tempo/Battle; stessi `top`/`right`/`left`; evita tagli accidentali sui satelliti. |

Nessun altro file modificato.

---

## 3. RISULTATO (QA tecnica in repo)

| Controllo | Esito |
|-----------|--------|
| **Agent allineato** | **SÌ** (strutturale: stesso guscio 72×72 degli altri elementi del rail sinistro). |
| **Slot Prossima azione completamente visibili** | **SÌ** (per bordo sinistro / inward X; **verifica consigliata** su iPhone fisico per notch / altezze estreme). |
| **Slot Commit completamente visibili** | **SÌ** (idem, solo in modalità embedded V3). |
| **Tempo / Battle invariati** | **SÌ** (stessi componenti, stessi offset; solo `overflow-visible` sui contenitori). |

---

## 4. RISCHI RESIDUI

- **Asse Y / fondo schermo:** non introdotto un bias verticale adattivo; su combinazioni molto basse (SE + hub Commit aperto in basso) potrebbe restare **margine** da validare in QA.
- **Bias X fisso 60px:** se in futuro cambiano raggio satellite o dimensione bottone, va **ricalibrato** il token (resta un unico punto di verità).
- **Legacy Commit (portal):** intenzionalmente **senza** bias per non rompere la geometria top-right.

---

## 5. GO / NO GO

**GO** — Intervento coerente con il sistema a due rail, una costante per l’offset satelliti sul rail sinistro, nessuna doppia verità verticale reintrodotta, modifiche rollbackabili e limitate allo scope consentito.

**NO GO** — Solo se la QA device mostrasse ancora tagli verticali: in quel caso il passo successivo sarebbe **bias Y adattivo** basato su misura (da valutare in intervento separato, con report dedicato).

---

## 6. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
