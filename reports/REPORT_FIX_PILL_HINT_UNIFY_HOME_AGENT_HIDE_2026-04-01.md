# REPORT FIX — UNIFICAZIONE PILL HINT + HIDE HOME M1SSION AGENT

**Ambiente:** app nativa iOS (Capacitor WKWebView)  
**Data report:** 2026-04-01  

---

## 1. FORENSICS SUMMARY

### Perché Battle è il reference corretto

1. **Geometria anchor** — In griglia GIOCA, Battle è in basso a destra: `FloatingBattlePillV3` è un `motion.button` 72×72; l’anchor `[data-pill-info-anchor="battle"]` avvolge solo quel controllo, senza wrapper più grandi. Il centro `(cx, cy)` e `hubSize` (clamp 48–72) coincidono col cerchio visivo.
2. **Direzione orizzontale** — Battle sta a **destra** dello schermo: l’hint che apre verso **ovest** (contenuto verso sinistra, verso il centro) produce connettore e box coerenti con l’HTML di riferimento (`PillHintBox`: `right: 50%`, `marginRight: 56`, pseudo-linee con `transformOrigin` a destra).
3. **Verticale** — Con poco spazio sotto in basso, `computeHintAnchor` tende a `variant === 4` (contenuto sopra l’hub), allineato al comportamento “premium” per angolo basso-destra.

### Perché gli altri risultavano disallineati / incoerenti (root cause)

| Causa | Evidenza | Effetto |
|--------|-----------|---------|
| **Layout React stale** | Prima del fix, `layout` non era invalidato al cambio `activePillId` | Primo paint con **testo del pill B** e **coordinate del pill A** → animazioni Framer (`hint-radius`, linee, opacity) partivano dal hub sbagliato; poi salto senza re-ingresso. Battle “sempre giusto” se aperto per primo o con `layout` nullo. | Già risolto in `PillHintOverlayV2` con `layoutEntry.pillId === activePillId`. |
| **Footprint anchor ≠ 72×72** | Timer 96×96, Commit blob 74×74 | `getBoundingClientRect` su wrapper troppo grande → hub hint e offset `HINT_OFFSET_ALONG` rispetto al centro “Battle-like”. | Già mitigato in `FloatingPillLayerV3` con guscio 72×72 (Timer/Commit centrati). |
| **Regola orizzontale generica** | `preferEast = cx <= 0.52 * vw` per tutti | Non modella la **griglia 3×3**: pill sinistra e destra dovrebbero aprire **verso il centro** come Battle (ovest da destra), non solo da una soglia viewport. | **Fix questa fase:** `preferEastForPill(pillId)` in `layoutGeometry.ts`. |

### Dove vive il container HOME “M1SSION AGENT”

- **File:** `src/components/command-center/CommandCenterHome.tsx`
- **Blocco:** commento `M1SSION AGENT - BLACK GLASS + WHITE MICRO-ENERGY`, `<div className="card-glass-white-energy">` che contiene `<AgentDiary />` (non il pill GIOCA centrale).
- **Nota:** `AgentEnergyPill` (rank pill fixed bottom-right) è **fuori** da questo container e non è stato nascosto.

### `PillHintConnector.tsx`

- **Non presente** nel repo sotto `pillHints/` (connettore = pseudo-elementi / `motion.div` in `PillHintBox.tsx`). Nessun file da analizzare.

---

## 2. FILE ANALIZZATI

| File | Ruolo | Coinvolgimento |
|------|--------|----------------|
| `PillHintOverlayV2.tsx` | Portal overlay, misura anchor, `AnimatePresence` | Alto — orchestrazione hint |
| `PillHintBox.tsx` | Box testo + linee (before/after) | Alto — stile connettore |
| `usePillHintAnimation.ts` | Durate/easing radius e contenuto | Medio — uguale per tutti i pill |
| `layoutGeometry.ts` | `computeHintAnchor` | Alto — posizionamento |
| `FloatingPillLayerV3.tsx` | Anchor DOM play surface | Alto — footprint 72×72 |
| `PillInfoOverlayContext.tsx` | `activePillId` | Medio |
| `CommandCenterHome.tsx` | Scroll home: card Agent | Alto — hide container |
| `AppHome.tsx` | Wiring Home + flag | Medio |
| `appHomeUiHide.ts` | Flag UI AppHome | Alto — rollback |

---

## 3. FILE TOCCATI (questa fase)

| File | Modifica | Motivo | Rischio |
|------|-----------|--------|---------|
| `layoutGeometry.ts` | `computeHintAnchor(..., pillId?)` + `preferEastForPill` | Allineare apertura alla griglia (stessa famiglia di Battle: verso il centro) | Basso — stesso fallback clip/larghezza |
| `PillHintOverlayV2.tsx` | Passa `pillId` a `computeHintAnchor` | Usare strategia per pill | Basso |
| `appHomeUiHide.ts` | `APP_HOME_HIDE_SCROLL_AGENT_CONTAINER` | Rollback one-line | Basso |
| `CommandCenterHome.tsx` | Prop `hideScrollAgentContainer` + `hidden` / `aria-hidden` | Nascondere solo UI scroll Agent | Basso — mount invariato |
| `AppHome.tsx` | Import flag + prop a `CommandCenterHome` | Solo App Home | Basso |

**Non toccati in questa fase:** login, IAP, BUZZ, notifiche, header, bottom nav, routing, daily engine, mini-game, logica tap pill, `FloatingAgentPillV3` play surface.

---

## 4. FIX APPLICATI

### A — Battle come reference master

- Battle resta **west-first** quando c’è spazio (pill a destra).
- Stessa logica **verso il centro** applicata agli altri slot:
  - **action, commit** → prefer **east**
  - **timer, battle** → prefer **west**
  - **agent** → **east** se `cx < 50%` viewport, altrimenti **west**
- Se il lato preferito esce dai margini, si mantiene la logica esistente di **flip** e **restringimento** `contentWidth` (paletti `MARGIN`).

### B — Strategia per posizione (griglia GIOCA)

Implementata in `preferEastForPill` (vedi §1) e attivata passando `activePillId` a `computeHintAnchor` da `PillHintOverlayV2`.

### C — Testo / box / connettore

- Stesso componente `PillHintBox` per tutti; coerenza migliorata **posizionando** il box rispetto al hub con la stessa regola orizzontale “inward” di Battle.

### D — Nascondere container HOME “M1SSION AGENT”

- **Metodo:** Tailwind `hidden` (`display: none`) sul wrapper glass + `aria-hidden={true}` quando il flag è attivo.
- **Motivo:** contenuti e hook (`AgentDiary`) restano **montati**; niente rimozione distruttiva; rollback: `APP_HOME_HIDE_SCROLL_AGENT_CONTAINER = false` in `appHomeUiHide.ts`.
- **Fuori scope:** pill **Agent** sulla play surface GIOCA (`FloatingPillLayerV3` / `FloatingAgentPillV3`) invariato.

---

## 5. TEST ESEGUITI

| Caso | Metodo | Esito |
|------|--------|--------|
| Build | `npm run build` | OK |
| Battle | Codice: `battle` → `preferEastForPill` = west | Coerente col reference |
| Action / Commit | east-first | Coerente griglia sinistra |
| Timer | west-first | Coerente griglia destra |
| Agent | split su metà viewport | Coerente centro |
| Hide container Agent | `hidden` + flag | UI scroll nascosta; mount preservato |
| Regressioni lint | `read_lints` su file toccati | OK |

**Test manuali iPhone** (obbligatori per il product owner): tap ogni pill in GIOCA, verificare hint; scroll Home senza card Agent; aprire Agent da play surface.

---

## 6. RISCHI RESIDUI

- **Angoli stretti:** su viewport molto basse, `variant` e `contentW` possono ancora compattare il box (comportamento voluto per paletti).
- **`Home.tsx` (route alternativa):** usa `<CommandCenterHome />` senza prop → container Agent **visibile** (default `hideScrollAgentContainer={false}`). Solo **AppHome** applica il flag.

---

## 7. GO / NO GO

| Criterio | Valutazione |
|----------|-------------|
| Hint allineati alla famiglia Battle (apertura verso centro + fix stale layout + anchor 72) | **GO** (codice); conferma UX su device |
| Container scroll “M1SSION AGENT” nascosto su App Home con rollback sicuro | **GO** |
| Play surface / pill / GIOCA intatti | **GO** |
| Prossimi mini-game | **GO** dopo smoke su iPhone |

---

## 8. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
