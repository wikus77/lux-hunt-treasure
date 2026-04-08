/**
 * Victory / Reward Orchestration V1 — constants
 * Daily pilot only. iOS-first, feature-flagged.
 *
 * ORDER POLICY V1 (deterministic, daily pilot):
 * MAJOR (PE fullscreen) → SMALL (M1U headless / pill) → STATUS (rank-up modal after gate release)
 *
 * Rank-up must not appear above PE fullscreen; gate blocks RankUpWatcher until sequence ends.
 */

/** Dispatched from GlobalPERewardOverlay when a PE modal closes (user or auto). */
export const PE_REWARD_OVERLAY_SETTLED_EVENT = 'm1-pe-reward-overlay-settled';

/** Wait after first daily M1U for possible same-tick PE (phase 2). */
export const DAILY_BATCH_WAIT_MS = 420;

export const DAILY_BATCH_WAIT_REDUCED_MOTION_MS = 180;

/** Merge two daily M1U SMALL lines in buffer within this window (same phase1 double-fire). */
export const DAILY_M1U_MERGE_WINDOW_MS = 1500;

/** Dedup: ignore same event id if seen within TTL. */
export const DEDUP_ID_TTL_MS = 2800;

/** After last replay in sequence, delay before rank-up modal may show (pill animation breathing room). */
export const RANK_GATE_RELEASE_AFTER_M1U_MS = 3000;

export const RANK_GATE_RELEASE_AFTER_M1U_REDUCED_MS = 1200;
