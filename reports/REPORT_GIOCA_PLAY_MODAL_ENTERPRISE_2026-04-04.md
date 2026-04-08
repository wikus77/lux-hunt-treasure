# REPORT — GIOCA enterprise modal (reject prior shell, rebuild)

**Date:** 2026-04-04  
**Scope:** UI layer only for GIOCA play surface when `APP_HOME_PLAY_MODAL_SHELL_ENABLED` is true.  
**Platform:** Capacitor iOS WKWebView (same web bundle as web).

---

## A. Executive summary

The first `PlayModalShell` was removed and replaced with **`PlayModalEnterpriseShell`**: a full-screen, two-layer dim (existing backdrop + additional opaque scrim), a single dominant hero card, a large primary CTA, and a **vertical list** of secondary actions (Royal Match–style clarity). The cross-layout pill grid stays mounted for wiring but is **`visibility: hidden` + `opacity: 0` + no pointer events** so it is not perceptually part of the UI. Logic (`HomePlaySurfaceContext`, handlers, `wrapPlaySurfaceTap`, launchers) is unchanged.

---

## B. Why the previous solution was correctly discarded

The prior shell failed the product bar for four concrete reasons:

1. **It still read as a hybrid HUD.** A medium glass card floated over the same play-surface layout. Dimming was light (`bg-black/35` only), so the eye still inferred “something orbital underneath,” not a dedicated mode.
2. **Weak modal containment.** There was no full-viewport **opaque** treatment between the user and the old structure; `opacity: 0` on pills does not remove mental model of scattered controls.
3. **Secondary actions looked like a mini-game of tiles** rather than a clear, subordinate list under one hero action—weak hierarchy versus top casual titles.
4. **The “moment” of entry was shallow.** A single scaled card did not reset context; Royal Match–like clarity needs a **mode switch** feel: darker world + one obvious panel.

This was not fixable with tweaks without changing the visual architecture, so the component was rejected and replaced outright.

---

## C. New architecture implemented

1. **Backdrop (existing `motion.button`):** When the enterprise shell is on, extra classes deepen dim and blur (`bg-black/58`, `backdrop-blur-[6px]`). Still calls `closeSurface` on tap; no context changes.
2. **Enterprise layer:** `motion.div` in `FloatingPillLayerV3` is the **direct** `AnimatePresence` child (correct exit lifecycle). **`PlayModalEnterpriseShell`** renders the **opaque scrim** (`bg-black/70`) plus the **dialog** wrapper and **hero card** (`motion` for scale/slide on open).
   - **One hero card** (~max 420px): top gradient accent bar, kicker + title + tagline, **status panel** (dynamic `nextBadge` copy), **primary CTA** (gradient + subtle glow pulse, `prefers-reduced-motion` respected), divider, **“More options”** list rows (Time, Agent, Commit if mounted, Battle) with icon + label + chevron.
3. **Pill grid:** `visibility: hidden`, `opacity: 0`, `[&_*]:pointer-events-none`, `aria-hidden` when shell active.

---

## D. Files created / modified

| Action | Path |
|--------|------|
| **Created** | `src/components/home/playModal/PlayModalEnterpriseShell.tsx` |
| **Deleted** | `src/components/home/playModal/PlayModalShell.tsx` |
| **Modified** | `src/components/home/floatingPillsV3/FloatingPillLayerV3.tsx` |
| **Modified** | `src/locales/en/common.json`, `it/common.json`, `fr/common.json` (enterprise copy keys) |

Unchanged: `HomePlaySurfaceContext`, routing, header, bottom nav, launchers implementation, pill hint wiring, feature flag file (still `APP_HOME_PLAY_MODAL_SHELL_ENABLED`).

---

## E. How existing logic was preserved

- `openSurface` / `closeSurface` unchanged; dismiss still the backdrop button.
- Primary action: still `handleNext` → `buttonClickFeedback` + `openMission()`.
- Secondaries: still `handleTime`, `handleAgent`, `handleCommit`, `handleBattle` (same as before shell).
- `showCommitTile` still mirrors `commitPillBlock != null`.
- `statusLine` uses the same `nextBadge` string as the floating next-action badge.
- No changes to `wrapPlaySurfaceTap` or hint state machine; pills are simply not visible or clickable while the shell is shown.

---

## F. How perception of the old HUD was removed

- **Opaque full-screen scrim** above the pill layer (not a translucent hint of controls).
- **Pills:** `visibility: hidden` (not just transparent—no layout “ghost” for the eye).
- **Stronger backdrop** when the shell is active.
- **Single hero card** as the only intentional focal surface.

---

## G. How the primary CTA was made dominant

- Full-width button, **larger typography** (`text-base`, bold, uppercase tracking).
- **High-contrast gradient** and **animated box-shadow pulse** (disabled when reduced motion).
- **Dedicated hint line** under the CTA (`play_modal_enterprise_primary_hint`).
- Clear separation: **border-t** section header before secondaries.

---

## H. Tests executed

| Test | Method | Result |
|------|--------|--------|
| Compile / bundle | `npm run build` | **Pass** |
| Lint (edited TSX) | IDE diagnostics | **Clean** |
| Manual UX (recommended) | Tap GIOCA on device/simulator | **Pending QA** |

Automated E2E for tap targets was not added (out of scope).

---

## I. Regression stance

- No edits to login, IAP, BUZZ, push, daily engine, mini-games, Pulse Breaker, PE/M1U/Rank/Victory, `UnifiedHeader`, or `BottomNavigation`.
- Rollback: set `APP_HOME_PLAY_MODAL_SHELL_ENABLED` to `false` in `appHomeUiHide.ts` to restore visible pill grid without reverting handler wiring.

---

## J. Go / No-Go

- **Go** for merge from a **code / architecture** perspective: new modal, old logic, build green, rollback flag intact.
- **Final product Go** requires **on-device QA** (TEST 1–6 in the incident brief)—especially flicker, safe areas, and WKWebView animation smoothness.

---

*End of report.*
