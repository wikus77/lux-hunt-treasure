# REPORT — Allineamento geometrico unico Home M1SSION™ (Floating Pills V3)

**Data:** 2026-03-21  
**Scope:** solo layout geometrico / posizionamento — nessuna modifica a logica DCL, Commit, Battle, Agent, Next Action, copy, CTA, animazioni visive dei pill, feature flag.

---

## 1. VERIFICA PRE-IMPLEMENTAZIONE

| Controllo | Esito |
|-----------|--------|
| **Tempo rimasto** e **M1SSION Battle** come pill di riferimento (rail destro, `w-max` + `items-end` + `gap-3`, `top = safe + stackTopOffsetPx`) | **Sì** — blocco destro lasciato strutturalmente identico (stesso contenitore, stessi figli, stessi token `stackTopOffsetPx` / safe-area / `right`). |
| **Prossima azione**, **Commit**, **Agent** da riallineare | **Sì** — erano nella stessa colonna del rail destro o dipendevano da footprint 200×200 / portal separato. |
| Problema: hub 200×200, colonna contaminata, Commit con spacer + `top` sintetico | **Confermato** — Action con box flex 200×200; Commit con `commitHubTopOffsetFromRailTopPx` + spacer `railHubSlotPx`; Agent sotto nella stessa colonna larga. |
| Strategia: un rail unico per asse, rimuovere doppia verità verticale Commit | **Applicata** — due rail (sinistro / destro), Commit in-flow nel layer V3, costanti di offset Commit rimosse. |

Nessuna contraddizione rispetto alla forensics: la correzione implementa esattamente quella diagnosi.

---

## 2. ROOT CAUSE CONFERMATE

1. **Prossima azione:** il flex partecipava al layout con **200×200** mentre il cerchio visibile è **72×72** centrato → l’asse del rail seguiva il box, non il centro del pill.
2. **Agent:** condivideva la colonna il cui **max width** era guidato dal footprint grande dell’Action (e dallo stack misto destro).
3. **Commit:** **doppia verità verticale** — `div` spacer 200×200 nel flow + `createPortal` con `top` calcolato da somma di altezze fisse (`commitHubTopOffsetFromRailTopPx`), scollegata dal layout reale del flex.

---

## 3. FIX APPLICATO

- **Rail destro:** solo `FloatingTimeRingPillV3` + `FloatingBattlePillV3` (nessun altro figlio).
- **Rail sinistro:** `ActionRadialHubPill` → `CommitRadialHubPill` / `FloatingCommitPillV3` → `FloatingAgentPillV3`, con `left: max(16px, safe-left)`, stesso `top` del destro (`safe-top + stackTopOffsetPx`), `items-start` + `w-max` + `gap-3`.
- **Action / Commit (radial):** footprint flex **72×72**, area radiale **200×200** in **absolute** centrata (`left-1/2 top-1/2 -translate`), `overflow-visible` — stesso principio di ancoraggio al **centro del pill visibile**.
- **Commit con `ENABLE_HOME_FLOATING_PILLS_V3`:** niente secondo portal su `document.body`; rendering **inline** nel `FloatingPillLayerV3`; niente `top` sintetico da costanti; backdrop resta `fixed inset-0` (solo layer di dismiss, non seconda geometria del rail).
- **`useFloatingPillsV3`:** restano solo **`zIndex`** e **`stackTopOffsetPx`** (unica origine verticale condivisa tra i due rail).

---

## 4. FILE TOCCATI

| File |
|------|
| `src/components/home/floatingPillsV3/FloatingPillLayerV3.tsx` |
| `src/components/home/floatingPillsV3/ActionRadialHubPill.tsx` |
| `src/components/home/floatingPillsV3/useFloatingPillsV3.ts` |
| `src/components/home/commitPillV3/CommitRadialHubPill.tsx` |

**Quinto file:** non necessario.

---

## 5. COME È STATO UNIFICATO IL SISTEMA GEOMETRICO

- **Un solo `stackTopOffsetPx`** per l’origine Y dei due rail (sinistro e destro), più safe-area.
- **Due colonne speculari:** destra `items-end`, sinistra `items-start`, entrambe `w-max` + `gap-3` — stesso criterio di allineamento ai bordi esterni dei pill “reali”, non a box artificiali 200×200 nel flow.
- **Portal unico** per l’overlay home V3 (`FloatingPillLayerV3` → `body`); Commit non aggiunge un secondo stack geometrico quando V3 è attivo.

---

## 6. COME È STATO RISOLTO PROSSIMA AZIONE

Sostituito il contenitore flex 200×200 con **72×72** + interno 200×200 centrato in absolute. Slot radiali, animazioni, classi dei pulsanti, navigazione e backdrop **invariati** — solo wrapper / anchor.

---

## 7. COME È STATO RISOLTO AGENT

L’Agent non è più nella colonna destra né in una colonna allargata dal footprint 200 dell’Action: sta nel **rail sinistro** sotto Commit/Prossima azione, con la stessa larghezza naturale dei pill (`w-max`).

---

## 8. COME È STATO RISOLTO COMMIT

- Rimossi **spacer** e **`commitHubTopOffsetFromRailTopPx`**.
- Con V3: **nessun** `createPortal` dedicato; posizione Y/X derivate dal **flex del rail sinistro** come gli altri pill.
- Mantenuto `id={COMMIT_PILL_V3_PORTAL_ID}` sul wrapper 72×72 embedded per continuità selector/DOM (un solo Commit radial montato: `AppHome` già evita il doppio mount quando V3 è on).

---

## 9. COSA NON È STATO TOCCATO

- `UnifiedHeader.tsx`, `BottomNavigation.tsx`, logica DCL / Commit / Battle / Agent / Next Action / Tempo, BUZZ, login/IAP/push, routing, Prize container, altri pill (M1U, Streak/Shop/Cashback), copy, CTA, comportamento modali (stessi trigger), feature flag esistenti.
- **Contenuto** del blocco destro Tempo/Battle: stessi componenti e props; solo **spostati** gli altri pill in un secondo contenitore assoluto a sinistra.

---

## 10. RISCHI RESIDUI

- **Posizione assoluta dei pill:** da **destra** (stack unico) a **sinistra** per Action / Commit / Agent — coerente con la specifica “rail sinistro”; va validato visivamente su dispositivo reale (safe area, notch).
- **Z-order:** Commit e Action condividono lo stesso `zIndex` del layer V3 (9500); eventuali sovrapposizioni tra radial aperti vanno verificate in QA (comportamento preesistente analogo con portal separato a 9480).
- **`#m1-commit-pill-v3-portal`:** con V3 non è più figlio diretto di `body` ma del layer V3 — se qualche script esterno assumeva `document.body > #...`, va aggiornato (nel repo non risultano usi oltre al componente).

---

## 11. GO / NO GO per rifiniture successive

- **GO** — geometria allineata a un’unica sorgente (flex rail + footprint 72); niente offset empirici aggiunti.
- Eventuali rifiniture solo dopo smoke su **iOS WKWebView** (Capacitor).

---

## 12. COMANDI ESEGUITI

Nell’ambiente IDE l’esecuzione di `npm run build` non ha prodotto output completato entro i timeout del sandbox (build progetto molto pesante).

**Da eseguire in locale (obbligatorio per te):**

```bash
npm run build
npm run cap:ios:incremental
```

---

## Perché il fix è strutturale (non empirico)

Non sono stati introdotti `margin-top` o offset numerici per “aggiustare a occhio”. La posizione verticale e orizzontale deriva da **un unico schema flex** (due rail) e da **footprint flex = dimensione del pill visibile (72×72)**, con l’area radiale 200×200 **fuori dal flusso** ma geometricamente centrata sul pill — eliminando la doppia verità del Commit (spacer + formula `top`).
