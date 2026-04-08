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

// ====== NATIVE PUSH (Capacitor iOS/Android) ======
// Master switch for native push notification integration
// Set to false to disable: permission prompts, token registration, listeners, deep links
export const NATIVE_PUSH_ENABLED = true;  // ✅ ATTIVO - Cron push integration verified working

// Native push analytics events (token registered, push received, push opened)
export const NATIVE_PUSH_ANALYTICS = true;  // ✅ ATTIVO

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

// ====== SUBSCRIPTIONS STEALTH MODE ======
// When true: Hide ALL subscription UI/entrypoints, users play as FREE
// M1U purchases remain active (shop/credits)
// Set to false to restore subscription plans visibility
export const SUBSCRIPTIONS_STEALTH = true;

// ====== LIVE TARGET SYSTEM™ (Phase 1 — static map marker only) ======
/** Temp Phase 1.3I: iOS / prod test without rebuilding — set `localStorage m1_live_target_force_on=true` + reload. */
function readLiveTargetForceOnFromStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('m1_live_target_force_on') === 'true';
  } catch {
    return false;
  }
}

/**
 * When true: single static LIVE TARGET marker on MapTiler3D. No gameplay.
 * - `VITE_LIVE_TARGET=0` → always off.
 * - Else on if: dev server, or `VITE_LIVE_TARGET=1`, or LS `m1_live_target_force_on=true`.
 */
export const LIVE_TARGET_ENABLED =
  import.meta.env.VITE_LIVE_TARGET === '0'
    ? false
    : import.meta.env.DEV ||
      import.meta.env.VITE_LIVE_TARGET === '1' ||
      readLiveTargetForceOnFromStorage();

// ====== GAME FEATURES ======
// Battle system
export const BATTLE_ENABLED = true;

// Buzz system
export const BUZZ_ENABLED = true;

// Buzz Map (area restriction)
export const BUZZ_MAP_ENABLED = true;

// ====== PROGRESS FEEDBACK SYSTEM ======
// Celebration overlays and progress toasts
// Set to false to disable all celebrations (safe rollback)
export const PROGRESS_FEEDBACK_ENABLED = true;  // 🎉 RE-ENABLED after CORS fix

// 🛡️ ALLOWLIST: Only these emails see Progress Feedback (dark ship)
// Add more emails to gradually rollout the feature
export const PROGRESS_FEEDBACK_ALLOWLIST: string[] = [
  'wikus77@hotmail.it',
  // Add more test users here before full rollout
];

// Helper to check if user is in allowlist
export const isUserInProgressFeedbackAllowlist = (email: string | undefined | null): boolean => {
  if (!PROGRESS_FEEDBACK_ENABLED) return false;
  if (!email) return false;
  return PROGRESS_FEEDBACK_ALLOWLIST.includes(email.toLowerCase());
};

/**
 * Pulse Breaker — legacy Progress Feedback fullscreen modals (CelebrationModal: «CASHOUT PERFETTO» / «CRASH» from gameEvents).
 * When false (default): ProgressFeedbackProvider ignores only PULSE_BREAKER_CASHOUT and PULSE_BREAKER_CRASH; emit in usePulseBreaker is unchanged.
 * Set true to restore green/red celebration modals for allowlisted users (reversible).
 */
export const PULSE_BREAKER_LEGACY_PROGRESS_FEEDBACK_MODALS_ENABLED = false;

// ====== STORE COMPLIANCE (Apple/Google) ======
// Deterministic progress systems (no RNG for win/lose decisions)
// When true: wheel/scratch/lottery use deterministic progress reveal
// When false: legacy random behavior (will be rejected by stores)
export const STORE_COMPLIANCE_MODE = true;

// Disable Stripe on native platforms (iOS/Android must use native IAP)
// When true: Stripe checkout hidden in Capacitor builds
// When false: Stripe accessible everywhere (iOS VIOLATION)
export const STRIPE_NATIVE_DISABLED = true;

// PulseBreaker (Crash/Aviator game) - DISABLED on native for store compliance
// This is a gambling-like mechanic that will cause Apple/Google rejection
// When true: PulseBreaker available (web only after compliance check)
// When false: PulseBreaker hidden everywhere
export const PULSE_BREAKER_ENABLED = true; // Web default, overridden in native

// Native In-App Purchases (Apple IAP + Google Play Billing)
// When true: Use native store billing for M1U and subscriptions
// When false: Fall back to Stripe (web only)
export const NATIVE_IAP_ENABLED = true;

// ====== LAUNCH FLAGS (19 Dec 2025) ======
// Set to true when ready for production launch
export const PRODUCTION_LAUNCH_READY = false;

// Maintenance mode (shows maintenance page)
export const MAINTENANCE_MODE = false;

// ====== VERA MISSION: BOMBA (Phase 1 MVP) ======
// When true: Show entrypoint for Bomb mission (dev/test only)
// Default OFF - enable via localStorage m1_vera_mission_bomb_enabled=true or VITE_VERA_MISSION_BOMB_ENABLED
// Uses function (not constant) so flag is read at render time - reliable on iOS WKWebView after localStorage set + reload
export function isVeraBombEnabled(): boolean {
  if (import.meta.env.VITE_VERA_MISSION_BOMB_ENABLED === 'true') return true;
  try {
    return localStorage.getItem('m1_vera_mission_bomb_enabled') === 'true';
  } catch {
    return false;
  }
}

// ====== DAILY MISSION ENGINE V2 (Phase 1 MVP) ======
// When true: show server-driven daily mission UI (v2). Legacy daily UI remains off (MISSIONS_ENABLED false).
// Rollback: set to false to hide v2 card.
export const DAILY_ENGINE_V2_ENABLED = true;

/**
 * Victory / Reward Orchestration V1 — daily pilot (PE → M1U → rank gate).
 * Default OFF. Enable: VITE_VICTORY_ORCHESTRATION_V1=true or localStorage m1_victory_orchestration_v1=true + reload.
 */
export const VICTORY_ORCHESTRATION_V1_ENABLED = false;

export function isVictoryOrchestrationV1Enabled(): boolean {
  if (VICTORY_ORCHESTRATION_V1_ENABLED) return true;
  if (import.meta.env.VITE_VICTORY_ORCHESTRATION_V1 === 'true') return true;
  try {
    return localStorage.getItem('m1_victory_orchestration_v1') === 'true';
  } catch {
    return false;
  }
}

/**
 * Victory System V4 — real daily reward presentation rollout (PE → M1U → rank gate).
 * Same conductor/listeners/overlays as QA-validated V1; separate flag for controlled product rollout.
 * Default OFF. Enable: VITE_VICTORY_SYSTEM_V4_REAL_DAILY=true or localStorage m1_victory_system_v4_real_daily=true + reload.
 * Does not enable the QA harness panel (remains dev / explicit QA env only).
 */
export function isVictorySystemV4RealDailyEnabled(): boolean {
  if (import.meta.env.VITE_VICTORY_SYSTEM_V4_REAL_DAILY === 'true') return true;
  try {
    return localStorage.getItem('m1_victory_system_v4_real_daily') === 'true';
  } catch {
    return false;
  }
}

/** True when the victory conductor should register (daily PE/M1U sequencing + rank gate). */
export function isVictoryOrchestrationConductorEnabled(): boolean {
  return isVictoryOrchestrationV1Enabled() || isVictorySystemV4RealDailyEnabled();
}

/** True when VITE_QA_MODE is set to an enabling value (not 0 / false / off). */
function isViteQaModeHarnessEligible(): boolean {
  const v = import.meta.env.VITE_QA_MODE;
  if (v == null || v === '') return false;
  const s = String(v).trim().toLowerCase();
  return s !== '0' && s !== 'false' && s !== 'no' && s !== 'off';
}

/**
 * Victory Orchestration QA harness — floating panel to fire synthetic PE/M1U (no server).
 * Default OFF. Enable: VITE_VICTORY_ORCH_QA_HARNESS=true, VITE_QA_MODE (non-off), localStorage m1_victory_orch_qa_harness=true, or import.meta.env.DEV + reload.
 * iOS QA: set VITE_QA_MODE=1 (or VITE_VICTORY_ORCH_QA_HARNESS=true) in the env used for `vite build` / Capacitor sync.
 */
export function isVictoryOrchQaHarnessEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  if (import.meta.env.VITE_VICTORY_ORCH_QA_HARNESS === 'true') return true;
  if (isViteQaModeHarnessEligible()) return true;
  try {
    return localStorage.getItem('m1_victory_orch_qa_harness') === 'true';
  } catch {
    return false;
  }
}

/** Preserved across ErrorBoundary «RIAVVIA EMERGENZA» so QA flags survive storage clear. */
export const VICTORY_ORCH_QA_LOCALSTORAGE_PRESERVE_KEYS = [
  'm1_victory_orch_qa_harness',
  'm1_victory_orchestration_v1',
  'm1_victory_system_v4_real_daily',
] as const;

// ====== HOME V2 — FLOATING LATERAL PILLS (AAA UI + launchers) ======
// When true: floating capsule stacks on Home. Rollback: false = layer hidden, zero layout change.
export const HOME_V2_FLOATING_SIDE_PILLS_ENABLED = true;

// Floating interactive nodes V2 (orb / ring / blob). When false: legacy capsule HomeSidePillsLayer.
export const ENABLE_FLOATING_NODES_V2 = true;
/** @deprecated use HOME_V2_FLOATING_SIDE_PILLS_ENABLED */
export const HOME_V2_SIDE_PILLS_ENABLED = HOME_V2_FLOATING_SIDE_PILLS_ENABLED;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
