/**
 * LIVE TARGET™ Phase 4 — gameplay state derivation (zoom gate + session flags).
 */

import type { LiveTargetDifficultyProfile } from './liveTargetPhase4Difficulty';

export type LiveTargetTerminalOutcome = 'none' | 'success' | 'fail';

export type LiveTargetGameplayState =
  | 'idle'
  | 'in_range'
  | 'zoom_eligible'
  | 'engaged'
  | 'captured_success'
  | 'captured_fail';

export type LiveTargetFailReason =
  | 'none'
  | 'out_of_range'
  | 'zoom_left_window'
  | 'capture_timeout'
  | 'miss_tap';

export function isZoomInWindow(zoom: number, min: number, max: number): boolean {
  return Number.isFinite(zoom) && zoom > 0 && zoom >= min && zoom <= max;
}

export function deriveLiveTargetGameplayState(args: {
  hasUserPosition: boolean;
  inRange: boolean;
  zoom: number;
  profile: LiveTargetDifficultyProfile;
  engaged: boolean;
  terminal: LiveTargetTerminalOutcome;
}): LiveTargetGameplayState {
  const { hasUserPosition, inRange, zoom, profile, engaged, terminal } = args;
  if (terminal === 'success') return 'captured_success';
  if (terminal === 'fail') return 'captured_fail';
  if (engaged) return 'engaged';
  if (!hasUserPosition) return 'idle';
  if (!inRange) return 'idle';
  const zEngage = isZoomInWindow(zoom, profile.engageZoomMin, profile.engageZoomMax);
  if (!zEngage) return 'in_range';
  return 'zoom_eligible';
}

/** True when Engage CTA may be shown (GPS + zoom gate, pre-engage, no terminal). */
export function isEngageButtonVisible(state: LiveTargetGameplayState): boolean {
  return state === 'zoom_eligible';
}

/** While engaged: player must stay inside capture zoom window. */
export function isZoomValidForEngagedCapture(zoom: number, profile: LiveTargetDifficultyProfile): boolean {
  return isZoomInWindow(zoom, profile.captureZoomMin, profile.captureZoomMax);
}
