# REPORT FIX VERO — PILL HINT SYSTEM

**Target:** Capacitor iOS WKWebView · **Data:** 2026-04-01  

---

## 1. FORENSICS SUMMARY

### Perché Battle “riusciva davvero”

1. **Posizione in griglia** — Battle è in **basso a destra**. L’euristica verticale (`roomBelow` vs `roomAbove`, `fitsBelow` / `fitsAbove`) sceglieva quasi sempre **`variant: 4`**: pannello **sopra** l’hub, connettore che entra dal basso del box verso l’hub — allineato al reference HTML originario.
2. **Orizzontale** — `west` apre il box verso sinistra (verso il centro schermo); `HINT_OFFSET_ALONG` (56px) e `PillHintBox` (`bottom: 29` sulle linee) producono la **distanza e l’angolo** che percepisci come “premium” sul device.
3. **Anchor** — 72×72 sul solo bottone battle → centro = centro visivo.

### Perché gli altri “non riuscivano davvero” (nonostante il report precedente)

| Pill | Cosa diceva il report | Cosa faceva il codice prima di questo fix |
|------|------------------------|-------------------------------------------|
| action / timer | “Unificato verso il centro” (solo **horizontal**) | **Variant** ancora da `roomBelow >= roomAbove` → spesso **variant 1** (sotto) per l’alto, **diverso da Battle** (sopra). Stesso connettore CSS, **geometria diversa** → family feeling diverso. |
| commit | Stesso horizontal east | In basso a sinistra l’euristica poteva dare **variant 1 o 4** a seconda dei pixel; **non speculare fissa** a Battle (BR). |
| agent | Split orizzontale | **Variant** incerta al centro (sopra/sotto quasi equivalenti) → risultato **instabile** rispetto agli angoli. |

### Root cause strutturale reale

- **Sì, architetturale:** una strategia **solo matematica** (spazio sopra/sotto) **non** equivale a una strategia **per-slot griglia GIOCA** allineata al reference Battle.
- **Battle era “fortunato”:** la sua cella BR coincide con l’output tipico dell’euristica; gli altri no.
- **Mismatch report vs UI:** il report descriveva l’unificazione **orizzontale**; la **verticale** restava generica → percezione reale ancora eterogenea.

---

## 2. FILE ANALIZZATI

| File | Ruolo | Coinvolgimento |
|------|--------|-----------------|
| `layoutGeometry.ts` | cx/cy, variant, horizontal, contentWidth | **Critico** — preset + safety viewport |
| `PillHintBox.tsx` | Offset 85/56, linee, testo | Critico — deve restare allineato ai numeri del modello |
| `PillHintOverlayV2.tsx` | Portal, measure, `pillId` → compute | Alto |
| `FloatingPillLayerV3.tsx` | Anchor DOM 72×72 | Già corretto in precedenza |
| `usePillHintAnimation.ts` | Motion | Invariato |
| `PillInfoOverlayContext.tsx` | `activePillId` | Invariato |

`PillHintConnector.tsx` — **assente** nel repo (connettore = blocchi in `PillHintBox`).

---

## 3. ROOT CAUSE VALIDATA

- **Strategia troppo generica** per **variant** (verticale) + dipendenza dalla sola **geometria viewport**, non dalla **cella** del play cross.
- **Preset mancanti** per allineare **tutti** i pill alla **stessa famiglia** di Battle (BR = west + sopra).
- **Mix:** orizzontale “verso centro” era un passo necessario ma **non sufficiente**; mancava **mapping esplicito** variant/side per pill.

---

## 4. FILE TOCCATI

| File | Modifica | Motivo | Rischio |
|------|-----------|--------|---------|
| `layoutGeometry.ts` | `PLAY_SURFACE_HINT_PRESET`, `panelBoundsViewport`, `resolvePlaySurfaceLayout`, ramo `pillId` vs legacy | Preset per pill + clip guard | Basso — fallback flip + shrink |
| `PillHintBox.tsx` | `HINT_OFFSET_PERP` al posto di `85` hardcoded | Single source of truth con il modello viewport | Basso |

---

## 5. FIX APPLICATO

### Preset play surface (stessa logica “Battle-like”)

| `pillId` | `horizontal` | `variant` | Semantica |
|----------|----------------|-----------|-----------|
| `battle` | west | **4** | **Reference** — pannello sopra, verso centro |
| `commit` | east | **4** | Riga bassa, simmetrico a Battle |
| `action` | east | **1** | Riga alta — pannello sotto, verso centro |
| `timer` | west | **1** | Riga alta — pannello sotto, verso centro |
| `agent` | east/west da metà viewport | **1** | Centro — default “sotto”; orizzontale come prima |

### Safety viewport

Se il preset uscirebbe dai margini / safe top-bottom stimati:

1. Prova **flip orizzontale**  
2. Poi **flip variant** (1 ↔ 4)  
3. Poi combinazione  
4. Poi **riduzione `contentWidth`** (step 16px, min 160)

### Perché è safe

- Nessun cambio a pill, CTA, play surface layout, routing.
- Senza `pillId`, `computeHintAnchor` usa il **vecchio** ramo generico (compatibilità futura).
- Battle **non** cambia preset (resta west + 4); solo il percorso è esplicito invece che “fortunato”.

### Coerenza connettore / box

`PillHintBox` non cambia geometria delle linee; cambia **solo** che `variant` e `horizontal` sono quelli del preset (salvo clip), quindi **stesso ordine percettivo** (sopra vs sotto l’hub) che su Battle funzionava.

---

## 6. TEST ESEGUITI

- `npm run build` — OK  
- Test manuali su device (obbligatori): Battle, action, timer, agent, commit, switch rapido, assenza overlap con header/nav.

---

## 7. RISCHI RESIDUI

- Stima altezza pannello (`EST_PANEL_BOX_H`) è approssimata; testo molto lungo potrebbe richiedere un remeasure ResizeObserver (già presente in overlay).
- Su viewport estreme il safety può ancora forzare flip — comportamento voluto.

---

## 8. GO / NO GO

| Domanda | Risposta |
|---------|----------|
| Tutti i pill allineati allo standard Battle **in codice**? | **Sì** — stesso schema preset + stessi offset (`HINT_OFFSET_ALONG` / `HINT_OFFSET_PERP`). |
| Problema **chiuso** senza verifica iPhone? | **NO GO pixel-perfect** finché non validi tu su device (non sostituibile da CI). |
| Tornare ai mini-game dopo smoke iOS? | **GO** dopo smoke OK. |

---

## 9. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
