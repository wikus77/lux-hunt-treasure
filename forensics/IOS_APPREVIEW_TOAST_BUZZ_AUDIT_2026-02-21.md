# TASK 1 — Audit Toast BUZZ (Source of Truth)

**Date:** 2026-02-21

## Source of truth: single Toaster (sonner)

- **File:** `src/components/ui/sonner.tsx`
- **Provider:** One global `<Toaster />` with fixed theme; all toasts (BUZZ, payment, success, error) go through `toast()` from `sonner` or `useToast()` which delegates to `sonnerToast` (see `src/hooks/use-toast.ts`).

## BUZZ clue toasts

- **Files:**  
  - `src/utils/buzzNotificationUtils.ts` — `toast(t('new_clue_extra') + " " + clueText, { duration: 5000 })`, `toast.info(t('clues_counter_reset'), …)`  
  - `src/components/buzz/BuzzRewardHandler.tsx`, `BuzzMapRewardHandler.tsx`, `BuzzExplosionHandler.tsx`, `BuzzActionButton.tsx` — `toast.success(…)`, `toast.error(…)`
- **No separate theme:** BUZZ uses the same `toast()` from `sonner`; presentation is controlled only by the global Toaster.

## Global Toaster theme (BUZZ-style token)

**Location:** `src/components/ui/sonner.tsx` — `toastOptions.style`:

| Token        | Value |
|-------------|--------|
| background  | `rgba(0, 12, 24, 0.95)` |
| color       | `white` |
| border      | `1px solid rgba(0, 209, 255, 0.5)` |
| borderRadius| `20px` |
| backdropFilter | `blur(24px)` |
| boxShadow   | `0 12px 40px rgba(0, 209, 255, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(0, 209, 255, 0.2)` |
| fontFamily  | `Orbitron, -apple-system, BlinkMacSystemFont, sans-serif` |
| fontSize    | `15px` |
| padding     | `14px 40px` |
| minHeight   | `48px` |
| width       | `450px` |
| maxWidth    | `min(92vw, 420px)` |
| position    | `top-center` |
| richColors  | `false` |

**Conclusion:** One toast system; all app toasts (including payment) already use this theme. No override needed for TASK 2.
