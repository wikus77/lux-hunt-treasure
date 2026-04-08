/**
 * LIVE TARGET™ Phase 4 — difficulty / zoom gate profiles (enterprise base for future levels).
 */

export type LiveTargetDifficultyCode = 'easy';

export type LiveTargetMovementPatternId = 'orbit_slow';

export interface LiveTargetDifficultyProfile {
  id: LiveTargetDifficultyCode;
  code: LiveTargetDifficultyCode;
  labelKey: string;
  /** Alias: min zoom while engaged / capture-valid (MapLibre zoom level). */
  captureZoomMin: number;
  /** Alias: max zoom while engaged / capture-valid. */
  captureZoomMax: number;
  zoomMinCapture: number;
  zoomMaxCapture: number;
  engageZoomMin: number;
  engageZoomMax: number;
  captureRadiusMeters: number;
  targetCount: number;
  decoyCount: number;
  movementPattern: LiveTargetMovementPatternId;
  movementSpeedFactor: number;
  /** After Engage: max time to tap target for success (ms). */
  captureWindowMs: number;
  engagedCaptureTimeoutMs: number;
  /** Future: max time to press Engage after becoming eligible (ms). */
  engageWindowMs: number;
  failOnZoomExit: boolean;
  failOnRangeExit: boolean;
  /** Map click while engaged (not on HTML target) = miss. */
  failOnMissTap: boolean;
  /**
   * When true and GPS fix exists, orbit is centered on the player so in-range + zoom gate are reachable worldwide.
   * Reference lat/lng remains the fallback until the first fix (see overlay).
   */
  anchorOrbitToUserWhenPositionAvailable: boolean;
  debugMetadata: string;
}

export const LIVE_TARGET_PHASE4_DEFAULT_DIFFICULTY: LiveTargetDifficultyCode = 'easy';

export const LIVE_TARGET_DIFFICULTY_EASY: LiveTargetDifficultyProfile = {
  id: 'easy',
  code: 'easy',
  labelKey: 'liveTarget.difficulty_easy',
  captureZoomMin: 13,
  captureZoomMax: 19,
  zoomMinCapture: 13,
  zoomMaxCapture: 19,
  engageZoomMin: 13,
  engageZoomMax: 19,
  captureRadiusMeters: 120,
  targetCount: 1,
  decoyCount: 0,
  movementPattern: 'orbit_slow',
  movementSpeedFactor: 1,
  captureWindowMs: 45_000,
  engagedCaptureTimeoutMs: 45_000,
  engageWindowMs: 120_000,
  failOnZoomExit: true,
  failOnRangeExit: true,
  failOnMissTap: true,
  anchorOrbitToUserWhenPositionAvailable: true,
  debugMetadata: 'phase4-easy-v2-forensic-fix',
};

export function getLiveTargetDifficultyProfile(code: LiveTargetDifficultyCode): LiveTargetDifficultyProfile {
  switch (code) {
    case 'easy':
    default:
      return LIVE_TARGET_DIFFICULTY_EASY;
  }
}
