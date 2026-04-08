/**
 * LIVE TARGET™ Phase 4.3 — enterprise level progression (client-side baseline).
 * Server sync can replace this layer later without changing UI contracts.
 */

import type { LiveTargetDifficultyCode } from './liveTargetPhase4Difficulty';

export type LiveTargetAnchorBehavior = 'user_when_available' | 'reference_fixed';

export interface LiveTargetLevelPlan {
  id: number;
  /** i18n key for modal badge line */
  badgeKey: string;
  /** i18n title; supports {{level}} */
  titleKey: string;
  subtitleKey: string;
  continueKey: string;
  nextUnlockedHintKey: string;
  difficultyCode: LiveTargetDifficultyCode;
  failOnMissTap: boolean;
  failOnZoomExit: boolean;
  failOnRangeExit: boolean;
  captureWindowMs: number;
  targetCount: number;
  motionProfile: string;
  anchorBehavior: LiveTargetAnchorBehavior;
}

/** Ordered baseline levels — extend with 3, 4… when gameplay expands. */
export const LIVE_TARGET_LEVEL_PLANS: LiveTargetLevelPlan[] = [
  {
    id: 1,
    badgeKey: 'liveTarget.victory_modal_badge',
    titleKey: 'liveTarget.victory_modal_title',
    subtitleKey: 'liveTarget.victory_modal_subtitle',
    continueKey: 'liveTarget.victory_modal_continue',
    nextUnlockedHintKey: 'liveTarget.victory_modal_next_hint',
    difficultyCode: 'easy',
    failOnMissTap: true,
    failOnZoomExit: true,
    failOnRangeExit: true,
    captureWindowMs: 45_000,
    targetCount: 1,
    motionProfile: 'orbit_slow',
    anchorBehavior: 'user_when_available',
  },
  {
    id: 2,
    badgeKey: 'liveTarget.victory_modal_badge',
    titleKey: 'liveTarget.victory_modal_title',
    subtitleKey: 'liveTarget.victory_modal_subtitle',
    continueKey: 'liveTarget.victory_modal_continue',
    nextUnlockedHintKey: 'liveTarget.victory_modal_next_hint',
    difficultyCode: 'easy',
    failOnMissTap: true,
    failOnZoomExit: true,
    failOnRangeExit: true,
    captureWindowMs: 45_000,
    targetCount: 1,
    motionProfile: 'orbit_slow',
    anchorBehavior: 'user_when_available',
  },
];

export function getLiveTargetLevelPlan(levelId: number): LiveTargetLevelPlan | undefined {
  return LIVE_TARGET_LEVEL_PLANS.find((l) => l.id === levelId);
}

export function getMaxLiveTargetLevelId(): number {
  return LIVE_TARGET_LEVEL_PLANS.reduce((m, l) => Math.max(m, l.id), 0);
}
