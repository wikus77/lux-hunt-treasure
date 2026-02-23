/**
 * MISSION PROFILE ENGINE™ — Fake report provider (UI-only).
 * Deterministic daily seed for slight variation; clamp 5–95.
 */

import type { AgentPerformanceReport } from './types';

function dailySeed(): number {
  const now = new Date();
  const dateKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) {
    h = (h << 5) - h + dateKey.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function clamp(pct: number): number {
  return Math.max(5, Math.min(95, Math.round(pct)));
}

const STATE_LABELS: Record<string, string> = {
  low: 'mission_profile_engine_state_low',
  medium: 'mission_profile_engine_state_medium',
  high: 'mission_profile_engine_state_high',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  low: 'mission_profile_engine_confidence_low',
  medium: 'mission_profile_engine_confidence_medium',
  high: 'mission_profile_engine_confidence_high',
};

export function getFakeReport(): AgentPerformanceReport {
  const seed = dailySeed();
  const rnd = (offset: number) => {
    const x = Math.sin(seed * 0.1 + offset) * 10000;
    return x - Math.floor(x);
  };
  const basePct = 45 + rnd(1) * 40;
  const delta = -3 + Math.floor(rnd(2) * 7);
  const pct = clamp(basePct + (rnd(3) * 6 - 3));
  const state: 'low' | 'medium' | 'high' =
    pct < 25 ? 'low' : pct < 60 ? 'medium' : 'high';
  const confidence: 'low' | 'medium' | 'high' =
    rnd(4) < 0.2 ? 'low' : rnd(5) < 0.5 ? 'medium' : 'high';
  const bar = (o: number) => Math.max(0.1, Math.min(1, 0.3 + rnd(o) * 0.6));
  return {
    percentage: pct,
    state,
    stateLabelKey: STATE_LABELS[state],
    strengths: ['mission_profile_engine_strength_1', 'mission_profile_engine_strength_2'],
    weaknesses: ['mission_profile_engine_weakness_1'],
    priorityAction: {
      labelKey: 'mission_profile_engine_priority_action_example',
      expectedDeltaRange: [5, 9] as [number, number],
      actionId: 'buzz_map_reduce_area',
    },
    dailyDelta: delta,
    confidenceBand: confidence,
    confidenceLabelKey: CONFIDENCE_LABELS[confidence],
    interferenceLineKey: 'mission_profile_engine_interference_line',
    bars: {
      intelligence: bar(10),
      geo: bar(11),
      discipline: bar(12),
      operational: bar(13),
    },
  };
}
