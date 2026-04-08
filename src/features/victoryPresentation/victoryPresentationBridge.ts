/**
 * Presentation-only bridge: PE overlay close → slight delay before M1U pill reacts.
 * Does NOT delay PE_REWARD_OVERLAY_SETTLED_EVENT (conductor unchanged).
 */

const WIN = typeof window !== 'undefined' ? window : undefined;

/** Extra beat after PE closes before M1U pill (presentation only). Tuned V3.1: snappier than 380ms. */
export const PE_TO_M1U_BRIDGE_EXTRA_MS = 260;

/** Arm extra delay for the next m1u-credit-event handled by GlobalM1UCreditOverlay. */
export function armPeToM1uPresentationBridge(): void {
  if (!WIN) return;
  try {
    (WIN as Window & { __m1_pe_to_m1u_bridge?: boolean }).__m1_pe_to_m1u_bridge = true;
  } catch {
    /* no-op */
  }
}

export function consumePeToM1uPresentationBridge(): number {
  if (!WIN) return 0;
  try {
    const w = WIN as Window & { __m1_pe_to_m1u_bridge?: boolean };
    if (w.__m1_pe_to_m1u_bridge) {
      delete w.__m1_pe_to_m1u_bridge;
      return PE_TO_M1U_BRIDGE_EXTRA_MS;
    }
  } catch {
    /* no-op */
  }
  return 0;
}

export function victoryPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}
