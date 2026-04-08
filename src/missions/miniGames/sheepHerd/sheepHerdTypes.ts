/**
 * Sheep Herd daily — client types (authoritative counts validated server-side).
 * © 2025 Joseph MULÉ – M1SSION™
 */

export interface SheepHerdGameParams {
  seed: string;
  week_index: number;
  difficulty_level?: string;
  time_limit_sec: number;
  sheep_total: number;
  required_in_pen: number;
  max_lost: number;
  scare_radius_mul: number;
  pen_radius_mul: number;
  sheep_speed_mul: number;
}

export interface SheepAgent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trapped: boolean;
  lost: boolean;
  /** Entropy for deterministic pseudo-random idle hops. */
  wanderPhase: number;
  /** Current grazing / scurry heading (rad). */
  idleHeading: number;
  /** Seconds until next idle hop (pause + burst rhythm). */
  idleTimer: number;
  /** Frames left to coast after an idle hop before “plant feet” damping (stop-go). */
  idleCoastFrames: number;
  /** 0–1 visual/feedback for hop accent (decays each frame). */
  hopAccent: number;
  /** Seconds until next micro shuffle hop (livelier field motion). */
  idleMicroTimer: number;
  /** Frames remaining to show “baa” bubble (0 = hidden). */
  baaDisplayFrames: number;
  /** Frames until this sheep may baa again. */
  baaCooldownFrames: number;
}

export interface RoundOutcomePayload {
  seed: string;
  duration_ms: number;
  sheep_trapped: number;
  sheep_lost: number;
  week_index: number;
}
