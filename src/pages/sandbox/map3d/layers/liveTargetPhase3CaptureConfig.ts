/**
 * LIVE TARGET™ Phase 3 — capture tutorial base (constants only).
 *
 * QA (no GPS): `localStorage.setItem('m1_live_target_force_range','true')` then reload the app
 * (flag is read once at module load in LiveTargetGeoOverlay).
 */

/** Max distance (meters) from user to target geo position to allow capture. */
export const LIVE_TARGET_CAPTURE_RADIUS_METERS = 120;

/** Toast duration after successful capture (ms). */
export const LIVE_TARGET_CAPTURE_FEEDBACK_MS = 2800;

/** How often to recompute in-range from GPS vs target (ms). */
export const LIVE_TARGET_IN_RANGE_POLL_MS = 350;
