# Home Wallet Pill — Dissolvenza progressiva — FASE 1 Report

**Data:** 2026-03-03  
**Branch:** `fix/home-wallet-pill-fade-smooth`  
**Tag rollback:** `safety/home-wallet-pill-fade-smooth-pre`

---

## File toccati

| File | Modifica |
|------|----------|
| `src/pages/AppHome.tsx` | (1) Ref `walletPillVisibleRef` per aggiornare lo stato solo quando `isIntersecting` cambia, evitando flicker. (2) Wrapper pill: `transition` 220ms → **280ms**; aggiunto **`willChange: 'opacity, transform'`**. Nessun unmount, nessun display/visibility. |

Nessun altro file modificato.

---

## Cosa è cambiato (da “netto” a fade reale)

- **Prima:** Stesso wrapper sempre montato con opacity/transform e transition 220ms; l’observer poteva fire più volte durante lo scroll e aggiornare lo stato in rapida successione, con transizione corta e senza hint di compositing.
- **Dopo:**
  1. **Transizione più lunga:** `280ms` (entro 240–320ms) per opacity e transform, così la dissolvenza è ben visibile.
  2. **`will-change: opacity, transform`** sul wrapper per promuovere il layer e rendere la transizione fluida (specie su iOS).
  3. **Stato solo quando cambia:** l’IntersectionObserver aggiorna `walletPillVisible` solo se `entry.isIntersecting !== walletPillVisibleRef.current`, così si evita flip-flop durante lo scroll e la dissolvenza è una sola (in/out) invece che tremolante.

Il pill **resta sempre nel DOM**; non si usa mai `display:none`, `visibility:hidden` o unmount. Solo opacity e transform con transition CSS.

---

## Rollback

```bash
git reset --hard safety/home-wallet-pill-fade-smooth-pre
```

---

## Build e sync

- **Build:** `npm run build` → **OK** (exit code 0).
- **Sync iOS:** `npx cap sync ios` → **OK** (exit code 0).
