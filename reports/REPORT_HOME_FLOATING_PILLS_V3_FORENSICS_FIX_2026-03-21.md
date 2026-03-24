# REPORT — HOME FLOATING PILLS V3 FORENSICS + FIX SAFE

**Data:** 2026-03-21  
**Contesto:** M1SSION™ Home, app iOS wrappata (Capacitor WKWebView).  
**Problemi segnalati:** (1) Agent non allineato; (2) tap Prossima azione / Commit → pill che spariscono, slot non si aprono; (3) Tempo / Battle come riferimento geometrico.

---

## 1. FORENSICS SUMMARY

### Root cause primaria — slot Prossima azione / Commit (pill che “spariscono”)

- In **`ActionRadialHubPill.tsx`** l’`animate` dei satelliti usa **`leftRailRadialSatelliteBiasXPx`** ma **`useFloatingPillsV3()` non veniva invocato** nel componente (solo import del modulo presente in passato, poi hook rimosso o mai collegato).
- In **`CommitRadialHubPill.tsx`** l’`animate` usa **`radialSlotBiasX`** ma **nessuna variabile o hook** definivano quel simbolo (mancavano import e `useFloatingPillsV3` + derivazione).
- **Effetto a runtime:** con `open === true`, React valuta il render dei `motion.button` satelliti e in strict mode si ottiene **ReferenceError** (`leftRailRadialSatelliteBiasXPx` / `radialSlotBiasX` is not defined). L’errore nel sottoalbero dei floating pills fa **fallire l’update** → sensazione di pill “spariti” / hub che non apre correttamente.
- **Non** era un problema di overflow, portal perso, né di CTA: era un **bug di binding** introdotto quando si è aggiunto il bias X senza mantenere la dichiarazione del valore.

### Root cause primaria — percezione Agent “fuori asse”

- Dopo il fix dei crash, l’asse orizzontale del rail sinistro è **72px + `items-start`**. Agent aveva già wrapper 72×72 ma **indentazione / struttura JSX incoerente** e mancava **`self-start`** esplicito come sugli altri item della colonna in alcuni casi di stretch implicito.
- **Correzione strutturale minima:** wrapper Agent con **`self-start`** allineato a Action/Commit (stessa colonna, nessun offset numerico “a occhio”).

### Cause secondarie (monitoraggio, non bloccanti nel fix attuale)

- **Action** backdrop con **`zIndex: -1`**: in alcuni stacking context iOS può essere fragile; non era la causa del crash. Lasciato invariato per non cambiare comportamento dismiss senza evidenza device.
- **Bias X = 60** resta **unica sorgente** in `useFloatingPillsV3.ts` (già documentata).

### File coinvolti

| File | Ruolo |
|------|--------|
| `ActionRadialHubPill.tsx` | Hub Prossima azione — **mancava hook** per `leftRailRadialSatelliteBiasXPx` |
| `CommitRadialHubPill.tsx` | Hub Commit embedded — **mancava** `radialSlotBiasX` e hook |
| `FloatingAgentPillV3.tsx` | Agent — allineamento colonna |
| `FloatingPillLayerV3.tsx` | Rails (nessuna modifica in questo intervento) |
| `useFloatingPillsV3.ts` | Token bias (nessuna modifica in questo intervento) |

---

## 2. MATRIX COMPLETA

| Pill | File | Wrapper | Portal | Footprint reale | Anchor | Transform | Rail | overflow | z-index (ordine) | OK / problema |
|------|------|---------|--------|-----------------|--------|-----------|------|----------|------------------|---------------|
| **Tempo** | `FloatingTimeRingPillV3.tsx` | `motion.button` ~72 | No (dentro layer) | 72 | Centro cerchio | anim glow | Destro `items-end` | pill `visible` | auto / glow | **OK** — riferimento |
| **Battle** | `FloatingBattlePillV3.tsx` | `motion.button` 72 | No | 72 | Centro | tap scale | Destro | visibile | auto | **OK** |
| **Prossima azione** | `ActionRadialHubPill.tsx` | `div` 72 + area 200 assoluta | No | 72 flex, 200 hub | Centro 200 = centro 72 | Framer x,y su slot | Sinistro `items-start` | `visible` | slot z 10; backdrop **-1** | **Problema:** variabile bias **non definita** → crash su open |
| **Commit** | `CommitRadialHubPill.tsx` | `div` 72 + 200 (embed) o portal legacy | Embed: no; legacy: sì | 72 / 200 | idem | Framer x,y | Sinistro (embed) | `visible` | slot z 10 | **Problema:** `radialSlotBiasX` **non definito** → crash su open |
| **Agent** | `FloatingAgentPillV3.tsx` | `div` 72 + `motion.button` 72 | No | 72×72 | Centro bottone | anim boxShadow | Sinistro | `visible` | badge assoluto | **Migliorato:** `self-start` + JSX pulito |

---

## 3. FIX APPLICATO

| File | Modifica | Perché è safe |
|------|----------|----------------|
| `ActionRadialHubPill.tsx` | `const { leftRailRadialSatelliteBiasXPx } = useFloatingPillsV3();` | Ripristina valore numerico definito; nessun cambio logica tap/navigazione. |
| `ActionRadialHubPill.tsx` | `self-start` sul wrapper 72×72 | Coerenza colonna con Commit/Agent. |
| `CommitRadialHubPill.tsx` | Import `useFloatingPillsV3` + `radialSlotBiasX` da token (0 se legacy portal) | Stesso comportamento previsto dal design (bias solo embed). |
| `CommitRadialHubPill.tsx` | `self-start` sul wrapper embedded | Allineamento esplicito. |
| `FloatingAgentPillV3.tsx` | `self-start` sul wrapper + indentazione JSX corretta | Stesso modello di cella rail; nessuna modifica a handler, copy, stili del bottone. |

**Non** toccati: Tempo, Battle, layer portal, stack top, feature flag, DCL, routing, header, bottom nav.

---

## 4. RISCHI RESIDUI

- **Backdrop Action `zIndex: -1`:** se su qualche combinazione iOS/WKWebView compaiono glitch di stacking, valutare `zIndex: 0` sul backdrop e `zIndex: 1` sull’area hub (intervento separato, con QA).
- **Bias X fisso:** se cambiano raggio o dimensione slot, aggiornare solo `useFloatingPillsV3.ts`.

---

## 5. GO / NO GO

**GO** — Causa certa (variabili non definite), fix minimale e rollbackabile, allineamento Agent senza offset empirici.

---

## 6. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```

---

## 7. VERIFICA SU IPHONE — Checklist

Dopo sync e install su device / Simulator:

- [ ] **Agent** visivamente allineato agli altri pill del rail sinistro (stesso bordo sinistro del cerchio 72).
- [ ] **Tempo** e **Battle** stessa posizione di prima (nessuno spostamento voluto).
- [ ] **Prossima azione:** tap → hub si apre, **pill centrale visibile**, 4 satelliti animati e tappabili.
- [ ] **Commit:** tap → 7 lettere visibili, ordine/gioco invariato.
- [ ] Nessun pill che **scompare** al toggle open.
- [ ] Nessun clipping evidente sui satelliti ai bordi (già mitigato da bias X).
- [ ] Smoke **Home** generale (scroll, altri elementi) senza errori in console Safari remote debug.

---

## Nota processo (enterprise)

Il sintomo “pill spariscono” coincide con **errore di runtime nel render condizionale** (`open`), non con redesign geometrico. La lezione è: ogni costante usata in **`animate`** deve avere **sempre** una definizione nel componente o props — i token restano in `useFloatingPillsV3`, ma **l’hook deve essere chiamato** laddove il valore è referenziato.
