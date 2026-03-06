# Home Wallet Pill — Fade on scroll — FASE 1 Report

**Data:** 2026-03-03  
**Branch:** `feat/home-wallet-pill-fade`  
**Tag rollback:** `safety/home-wallet-pill-fade-pre`

---

## File toccati

| File | Modifica |
|------|----------|
| `src/pages/AppHome.tsx` | Aggiunto `useRef` per sentinella; stato `walletPillVisible`; `useEffect` con `IntersectionObserver` su `div.m1-first-content-offset-compact`; stili su `#m1u-pill-home-slot` (opacity, transform, transition, pointer-events). Ref e `aria-hidden` sul div sentinella. |

Nessun altro file modificato. Nessuna modifica a impaginazione o layout della Home.

---

## Descrizione tecnica

- **Strategia:** IntersectionObserver + sentinella in cima al contenuto (elemento già esistente `m1-first-content-offset-compact`).
- **Observer:** `root: null` (viewport), `threshold: 0`, `rootMargin: "-100px 0px 0px 0px"` (soglia ~100px: il pill si nasconde quando la sentinella è oltre 100px sopra la viewport).
- **Stato:** `walletPillVisible` = `entry.isIntersecting`. Quando la sentinella esce dalla zona considerata (scroll giù) → `false`; quando rientra (scroll su) → `true`.
- **Stili sul wrapper del pill:**  
  - `opacity`: 1 se visibile, 0 se nascosto.  
  - `transform`: `translateY(0)` se visibile, `translateY(-8px)` se nascosto.  
  - `transition`: `opacity 220ms ease, transform 220ms ease`.  
  - `pointer-events`: `auto` se visibile, `none` se nascosto (nessun tap quando nascosto).

---

## Come funziona

1. All’avvio, la sentinella è in viewport → `walletPillVisible = true` → pill pienamente visibile e cliccabile.
2. Scroll verso il basso: la sentinella esce dalla viewport (con margine 100px) → `isIntersecting` diventa `false` → `walletPillVisible = false` → il pill sfuma (opacity 0, translateY -8px) e `pointer-events: none`.
3. Scroll verso l’alto: la sentinella rientra → `isIntersecting` true → `walletPillVisible = true` → il pill riappare con transizione e torna cliccabile.

Nessun listener su scroll, nessun throttle; solo observer. Comportamento limitato alla route Home (logica e wrapper sono solo in AppHome).

---

## Rischio

**Rischio:** Nessuno. Solo stato UI e stili sul wrapper del pill in AppHome. Nessun cambiamento a wallet, fetch, realtime, IAP, BUZZ, BUZZ MAP, login, delete-account, push o a layout/impaginazione della Home.

---

## Rollback

```bash
git reset --hard safety/home-wallet-pill-fade-pre
```

---

## Build e sync

- **Build:** `npm run build` → **OK** (exit code 0).
- **Sync iOS:** `npx cap sync ios` → **OK** (exit code 0).
