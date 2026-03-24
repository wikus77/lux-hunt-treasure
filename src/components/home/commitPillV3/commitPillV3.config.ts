/**
 * Commit Pill V3 — POC config (iOS Capacitor WKWebView only).
 * Rollback: ENABLE_COMMIT_PILL_V3 = false (instant off).
 */

import { Capacitor } from '@capacitor/core';

/** Master switch — central Commit node POC. */
export const ENABLE_COMMIT_PILL_V3 = true;

/**
 * When true (and ENABLE_COMMIT_PILL_V3): show radial hub — tap center toggles 7 slots (daily word).
 * When false: classic single-tap CommitPillV3 (opens Commit modal directly).
 */
export const COMMIT_PILL_V3_RADIAL_HUB = true;

/**
 * Optional actions for radial slots 0–7 (wire later; missing = safe no-op).
 * Example: `COMMIT_RADIAL_SLOT_ACTIONS[0] = () => openSomething();`
 */
export const COMMIT_RADIAL_SLOT_ACTIONS: Partial<Record<number, () => void>> = {};

/**
 * 28 words (7 chars each), one per mission day — never repeated in the 28-day cycle.
 * Index = (missionDay - 1) % 28.
 */
export const COMMIT_RADIAL_DAILY_WORDS_28: ReadonlyArray<string> = [
  'M1SSION', 'CONTROL', 'VICTORY', 'SUCCESS', 'WINNERS', 'REWARDS', 'FREEDOM',
  'LEGENDS', 'WARRIOR', 'TACTICS', 'EXPLORE', 'CONQUER', 'BRAVEST', 'STRIKER',
  'HUNTERS', 'ELITEST', 'RITUALS', 'COMMITS', 'MISSION', 'NOBLEST', 'HONORED',
  'POWERED', 'VALORED', 'STARTER', 'FINALER', 'GLORYED', 'QUESTER', 'REV3NGE',
];

/**
 * Below UnifiedHeader (9999) and BottomNavigation (10000).
 * Slightly below full lateral stack (9500) so order is predictable if both enabled.
 */
export const COMMIT_PILL_V3_Z_INDEX = 9480;

export const COMMIT_PILL_V3_PORTAL_ID = 'm1-commit-pill-v3-portal';

/** Per product scope: pill mounts only on native iOS wrapper (not PWA/web/Android). */
export function isCommitPillV3IosCapacitor(): boolean {
  try {
    return Capacitor.isNativePlatform() === true && Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
}
