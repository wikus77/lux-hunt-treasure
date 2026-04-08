# REPORT — GIOCA modal V3 (full-width top + bottom sheets)

**Date:** 2026-04-04  

## A. Executive summary

The GIOCA enterprise “single card” UI was replaced with a **two-step, full-width** presentation: a **top sheet** (hero band + status) that slides down from above, a **bottom sheet** (dominant CTA + compact secondaries) that slides up with staggered timing, plus a **scrim** layer. Backdrop (`motion.button`) timing was retuned so it **fades in quickly** and **exits last** after the sheets. Handlers, context, and pill wiring are unchanged.

## B. Files created / modified

| File | Action |
|------|--------|
| `src/components/home/playModal/PlayModalGiochaLayers.tsx` | **Created** — `PlayModalGiochaScrim`, `PlayModalGiochaTopSheet`, `PlayModalGiochaBottomSheet` |
| `src/components/home/playModal/PlayModalEnterpriseShell.tsx` | **Replaced** with barrel re-exports + `PlayModalEnterpriseShellProps` alias |
| `src/components/home/floatingPillsV3/FloatingPillLayerV3.tsx` | **Modified** — `AnimatePresence` renders three keyed motion roots; backdrop enter/exit timings |

## C. Top container

- `fixed` top, **full width** with `px-2`, **safe-area** top padding.
- **Rounded bottom** only (`rounded-b-[1.35rem]`), gradient solid panel, cyan border/glow.
- **Icon** (`Target`) in a lit tile; **kicker**, **large title** (`play_modal_title`), **tagline** (`play_modal_enterprise_tagline`), **status** (`play_modal_enterprise_status_label` + `statusLine`) — **no separate status card**, only a top border divider.
- Enter: `y: -64 → 0`, `opacity 0→1`, **260ms**, `cubic-bezier(0.22, 1, 0.36, 1)`.
- Exit: **after bottom** starts (`delay 0.13s`), slides up with same duration/ease.

## D. Bottom container

- `fixed` bottom, **full width**, **safe-area** bottom padding.
- **Rounded top** sheet (`rounded-t-[1.75rem]`), gradient panel, shadow upward.
- **CTA**: full width, **~60px** min height, **solid** cyan (`#0891b2`), **white bold** label with text-shadow, inner highlight + **breathing** outer glow.
- **CTA settle**: scale `0.97→1` after **bottom animation completes** + **80ms**.
- **Secondaries**: **2×2** (4 items) or **single row of 3** — compact tiles, **low** border/opacity vs CTA (not iOS settings rows).

## E. Timings (seconds)

| Layer | Enter | Exit |
|-------|-------|------|
| Backdrop (FPLV3) | **0.14s** ease-out | **0.16s** after **0.42s** delay |
| Scrim | **0.14s** | **0.15s** after **0.34s** delay |
| Top sheet | **0.26s**, `y -64` | **0.26s**, `y -64`, delay **0.13s** |
| Bottom sheet | **0.29s**, `y +68`, **delay 0.11s** from mount | **0.27s**, `y +68`, **no** delay |
| CTA settle | delay **0.48s** from mount (`0.11+0.29+0.08`) | — |

`prefers-reduced-motion`: near-instant transitions.

## F. Logic preserved

- `handleNext` / `handleTime` / `handleAgent` / `handleCommit` / `handleBattle` unchanged.
- `HomePlaySurfaceContext`, `wrapPlaySurfaceTap`, pill grid **hidden** as before.
- `APP_HOME_PLAY_MODAL_SHELL_ENABLED` unchanged.

## G. Readability

- Title / tagline / status: **high** `text-white` / `white/90` / **bold** status line.
- CTA: **white** on saturated solid fill + **text-shadow** for edge contrast.
- Secondaries: **white/75** labels on slightly lifted tiles (subordinate).

## H. Tests executed

- `npm run build` — **pass**
- Device QA — **recommended** (AnimatePresence + Fragment + exit order)

## I. No regressions (code scope)

No edits to routing, BUZZ, IAP, push, PE, Victory, header, bottom nav, or launcher implementations beyond the play modal mount site.

## J. Go / No-Go

- **Go** on architecture and build.
- **Final Go** after iPhone check: exit choreography, tap-through to backdrop dismiss, no flicker.
