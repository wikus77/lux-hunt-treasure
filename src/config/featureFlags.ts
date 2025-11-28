// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Feature Flags Configuration - Production Launch 19 Dec 2025

// ====== CORE FEATURES ======
export const DNA_ENABLED = false;
export const PULSE_ENABLED = true;
export const MAP3D_SANDBOX_ENABLED = false;

// ====== PUSH NOTIFICATIONS ======
// Push Preflight panel (incomplete, hidden until fully implemented)
export const PUSH_PREFLIGHT_ENABLED = false;

// New unified push subscribe flow (one-tap activation)
export const NEW_PUSH_SUBSCRIBE_FLOW = true;  // ✅ ATTIVO - One-tap push con backend upsert

// FCM Push (Firebase Cloud Messaging)
export const FCM_PUSH_ENABLED = true;  // ✅ ATTIVO

// VAPID Web Push
export const VAPID_PUSH_ENABLED = true;  // ✅ ATTIVO

// ====== PRODUCTION SAFETY ======
// Enable verbose logging in production (disable for launch)
export const VERBOSE_LOGGING = import.meta.env.DEV;

// Enable debug panels in production
export const DEBUG_PANELS_ENABLED = import.meta.env.DEV;

// Enable error boundary detailed errors
export const DETAILED_ERRORS = import.meta.env.DEV;

// ====== MONETIZATION ======
// Stripe payments enabled
export const STRIPE_ENABLED = true;

// M1U system enabled
export const M1U_ENABLED = true;

// ====== GAME FEATURES ======
// Battle system
export const BATTLE_ENABLED = true;

// Buzz system
export const BUZZ_ENABLED = true;

// Buzz Map (area restriction)
export const BUZZ_MAP_ENABLED = true;

// ====== LAUNCH FLAGS (19 Dec 2025) ======
// Set to true when ready for production launch
export const PRODUCTION_LAUNCH_READY = false;

// Maintenance mode (shows maintenance page)
export const MAINTENANCE_MODE = false;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
