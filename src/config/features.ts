/**
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 * Feature flags per controllo graduale dei rollout
 */

export const FEATURE_FLAGS = {
  // Push notification activation UI
  PUSH_ACTIVATE_UI: import.meta.env.VITE_PUSH_ACTIVATE_UI === 'on' || false,
} as const;
