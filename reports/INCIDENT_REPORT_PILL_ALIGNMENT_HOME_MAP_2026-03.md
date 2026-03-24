# INCIDENT REPORT — ALIGNMENT PILL HOME → MAP (SOLO POSIZIONAMENTO)

**Data:** 2026-03  
**Scope:** Solo posizionamento pill HOME allineato a MAP. Zero modifiche logica/design/animazioni.

---

## 1. FILE ANALIZZATI

### HOME (pill e layout)
| File | Ruolo |
|------|--------|
| `src/pages/AppHome.tsx` | Monta M1U pill (fixed 80px), FloatingPillLayerV3, CommitRadialHubPill |
| `src/components/home/floatingPillsV3/FloatingPillLayerV3.tsx` | Container fixed; left stack + right stack (Prossima azione, Agent, Tempo rimasto, Battle) |
| `src/components/home/floatingPillsV3/useFloatingPillsV3.ts` | Fornisce `zIndex`, `stackTopOffsetPx` (era 168) |
| `src/components/home/floatingPillsV3/ActionRadialHubPill.tsx` | Pill Prossima azione (radial hub) |
| `src/components/home/commitPillV3/CommitRadialHubPill.tsx` | Pill Commit (posizione OK — non modificato) |

### MAP (riferimento)
| File | Ruolo |
|------|--------|
| `src/pages/sandbox/MapTiler3D.tsx` | M1U slot: top 96px + safeArea, left 16px; right orbs: right 16px, bottom 240px; RealtimePlayers: top 150px, right 16px |
| `src/components/battle/BattlePill.tsx` | left 16px, bottom 240px + safeAreaBottom, z-1001 |
| `src/missions/ui/MissionPill.tsx` | left 16px, bottom 170px + safeAreaBottom |

---

## 2. DIFFERENZE TROVATE (HOME vs MAP)

| Aspetto | HOME (prima) | MAP (riferimento) |
|---------|----------------|--------------------|
| Prima riga verticale (top) | 168px + safeArea (stackTopOffsetPx) | 96px + safeArea (M1U row) |
| Distanza bordo sinistro | max(10px, safeArea) | 16px (left-4) |
| Distanza bordo destro | max(10px, safeArea) | 16px (right-4) |
| Prossima azione (ActionRadialHubPill) | marginTop 56+12 → sotto 168px | N/A (MAP ha M1U a 96px) |

**Strategia:** Portare la prima riga HOME a 96px (come MAP), bordi a 16px, e rimuovere il marginTop extra da ActionRadialHubPill così il primo pill è a 96px.

---

## 3. MODIFICHE APPLICATE (SOLO POSITION)

1. **`useFloatingPillsV3.ts`**
   - `stackTopOffsetPx`: **168 → 96** (allineato alla prima riga MAP).

2. **`FloatingPillLayerV3.tsx`**
   - Left stack: **left** da `max(10px, env(safe-area-inset-left, 0px))` a **`max(16px, env(safe-area-inset-left, 0px))`**.
   - Right stack: **right** da `max(10px, env(safe-area-inset-right, 0px))` a **`max(16px, env(safe-area-inset-right, 0px))`**.
   - Top invariato: `calc(env(safe-area-inset-top, 0px) + ${stackTopOffsetPx}px)` (ora 96px).

3. **`ActionRadialHubPill.tsx`**
   - Rimosso **marginTop: 'calc(56px + 12px)'** così il pill è in linea con la prima riga a 96px.

**NON modificati:** Commit pill, M1U pill, design/dimensioni/animazioni, logica, UnifiedHeader, BottomNavigation, CSS globale.

---

## 4. CONFERMA

- **Zero modifiche logica:** Solo valori di layout (top offset, left/right, marginTop).
- **Zero regressioni intenzionali:** Nessun tocco a login, BUZZ, notifiche, IAP, header, bottom nav.
- **Rollback:** Revert delle stesse 3 file (ripristino 168, 10px, marginTop) riporta allo stato precedente.

---

## 5. RISCHI

- **Possibile sovrapposizione con M1U su HOME:** M1U è a 80px, prima riga pill ora a 96px. La prima riga è sotto M1U (80 + altezza pill ~56 ≈ 136px), quindi 96px è sopra; in MAP la prima riga è 96px (M1U stesso). Se in HOME si vuole “sotto M1U”, si può riportare `stackTopOffsetPx` a 148 (80+56+12) invece di 96. **Decisione:** Allineamento richiesto = MAP → 96px mantenuto; se serve “sotto M1U” si può aumentare solo il offset in un secondo step.
- **MAP:** Nessuna modifica; nessun rischio su MapTiler3D.

---

## 6. GO / NO GO

**GO** — Modifiche minime, solo posizionamento, rollback semplice.

---

## COMANDI

```bash
# Backup branch (eseguire prima di merge in main)
git checkout -b safety/pill-position-home-before-map-align

# Build e sync
npm run build
npm run cap:ios:incremental
```

---

## ROLLBACK (se necessario)

In `useFloatingPillsV3.ts`: `stackTopOffsetPx: 96` → `168`.  
In `FloatingPillLayerV3.tsx`: `max(16px, ...)` → `max(10px, ...)` per left e right.  
In `ActionRadialHubPill.tsx`: aggiungere di nuovo `marginTop: 'calc(56px + 12px)'` al wrapper.
