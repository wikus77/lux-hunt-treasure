# REPORT FIX — Play surface pill layout ordinato

**Data:** 2026-04-02  
**Scope:** Solo `FloatingPillLayerV3.tsx` (layout condizionale + motion esistente).

---

## 1. Forensics summary

| Prima | Problema |
|--------|----------|
| Due binari fissi | Sinistra: Prossima azione → Commit → Agent in colonna; destra: Tempo → Battle. In play surface i cinque pill seguivano lo stesso schema, con **Agent in basso a sinistra** invece che al centro. |
| Nessun branch layout | `playGateEnabled` nascondeva i quattro pill e mostrava solo Agent sulla rail sinistra; dopo **GIOCA** riapparivano tutti **negli stessi anchor** dei due binari → disposizione non simmetrica rispetto alla richiesta “croce” premium. |
| Agent | Sempre ultimo nella colonna sinistra in modalità normale; in play mode non c’era posizione dedicata centrale. |

**Path minimo:** `usePlayCrossLayout = playGateEnabled && surfaceActive` → un solo `div` a griglia CSS 3×3 (`min-content | 1fr | min-content` × righe analoghe) con celle ancorate agli angoli e al centro; fuori da quel flag si ripristina il markup legacy byte-identico al precedente.

---

## 2. File analizzati

| File | Ruolo | Coinvolgimento |
|------|--------|-----------------|
| `FloatingPillLayerV3.tsx` | Portale pill + play gate | **Modificato** |
| `HomePlaySurfaceContext.tsx` | `surfaceActive` | Solo lettura (nessuna modifica) |
| `FloatingAgentPillV3.tsx` | Footprint 72×72 | Invariato; riusato nel slot centrale |
| `floating-pills-v3.ts` | z-index | Invariato |

---

## 3. File toccati

| File | Modifica | Motivo | Rischio |
|------|----------|--------|---------|
| `FloatingPillLayerV3.tsx` | Branch `usePlayCrossLayout` + griglia + `commitPillBlock` condiviso | 5 posizioni richieste solo con surface aperto | Basso: legacy invariato quando branch false |

---

## 4. Fix applicati

**Nuovo layout (solo GIOCA attivo):**

| Posizione | Pill |
|-----------|------|
| Alto sinistra | Prossima azione (`ActionRadialHubPill`) |
| Alto destra | Tempo (`FloatingTimeRingPillV3`) |
| **Centro** | **M1SSION Agent** (`FloatingAgentPillV3`, se non `hideAgentPill`) |
| Basso sinistra | Commit (radial o float, stessa logica di prima) |
| Basso destra | Battle (`FloatingBattlePillV3`) |

- Area griglia: stessi vincoli verticali delle rail (`stackTopOffsetPx`, `bottom: 88px + safe + 10px`), orizzontali `max(16px, safe inset)`.
- **Motion:** stesso `playPillMotionProps` con ordine stagger **0→4** (azione, tempo, agent, commit, battle) così l’ingresso resta fade-up + scale morbido.
- **Invariato:** backdrop, callback `onTap`, `HomeGiocaCta`, header/nav, pill components interni, layout **fuori** da `playGateEnabled && surfaceActive` (binari originali).

**Chiusura surface:** si torna al layout legacy; l’Agent può spostarsi visivamente dalla cella centrale alla colonna sinistra (due mount distinti). Accettato per path minimo; l’utente ha priorità sull’apertura ordinata.

---

## 5. Test eseguiti

- `npm run build` — OK.

Verifica consigliata su iPhone: GIOCA → verifica 5 posizioni; chiudi backdrop → solo Agent sulla sinistra (gate idle); gate disabilitato → layout storico a due binari.

---

## 6. Rischi residui

- Transizione visiva Agent centro ↔ rail sinistra alla chiusura del play surface (vedi sopra).
- `commitPillBlock` null in configurazioni edge (stesso edge case del codice precedente).

---

## 7. GO / NO-GO

- **Ordine richiesto in play mode:** sì (griglia esplicita).  
- **Agent al centro:** sì (riga/colonna 2, `justifySelf`/`alignSelf` center).  
- **Premium:** griglia simmetrica + motion esistente.  
- **Mini-game / engine:** nessun impatto.

---

## 8. Comandi finali

```bash
npm run build
npm run cap:ios:incremental
```
