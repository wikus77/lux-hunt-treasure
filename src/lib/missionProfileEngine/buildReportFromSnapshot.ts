/**
 * MISSION PROFILE ENGINE™ — Build report from RPC snapshot + delta.
 * NO LEADERBOARD. Weights: Intelligence 24%, Geo 28%, Discipline 28%, Operational 20%.
 * 90% deterministic + 10% daily noise (seed user_id + YYYY-MM-DD).
 * © 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import type { AgentPerformanceReport } from './types';

export interface MPESnapshot {
  clues_count?: number;
  buzz_map_radius_km?: number | null;
  buzz_map_count_this_week?: number;
  current_streak_days?: number;
  longest_streak_days?: number;
  last_check_in_date?: string | null;
  activity?: Record<string, unknown>;
  m1_units?: number;
  pulse_energy?: number;
  cashback_accumulated_m1u?: number;
  cashback_lifetime_earned_m1u?: number;
  daily_commit_completed_today?: boolean;
  error?: string;
}

export interface MPEDelta {
  delta_total?: number | null;
  insufficient_history?: boolean;
  today_score?: number | null;
  yesterday_score?: number | null;
  bars_delta?: {
    intelligence?: number;
    geo?: number;
    discipline?: number;
    operational?: number;
  } | null;
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

function clamp(pct: number): number {
  return Math.max(5, Math.min(95, Math.round(pct)));
}

function norm(value: number, max = 100): number {
  return Math.max(0, Math.min(1, value / max));
}

/** Daily noise ±10% from seed (user_id + YYYY-MM-DD), stable for the day */
function dailyNoise(userId: string | undefined, dateKey: string): number {
  const seed = `${userId ?? ''}-${dateKey}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const t = Math.abs(h) / 2147483647;
  return (t * 2 - 1) * 10;
}

/**
 * Dimension scores 0..1 from inputs (NO leaderboard).
 * Weights: Intelligence 24%, Geo 28%, Discipline 28%, Operational 20%.
 */
function dimensionScores(snapshot: MPESnapshot): { intelligence: number; geo: number; discipline: number; operational: number } {
  const clues = snapshot.clues_count ?? 0;
  const buzzMapCount = snapshot.buzz_map_count_this_week ?? 0;
  const buzzRadius = snapshot.buzz_map_radius_km ?? 0;
  const streak = snapshot.current_streak_days ?? 0;
  const dailyCommit = snapshot.daily_commit_completed_today ?? false;
  const pe = snapshot.pulse_energy ?? 0;
  const m1u = snapshot.m1_units ?? 0;

  const intelligence = norm(clues, 200) * 0.6 + norm(pe, 500) * 0.4;
  const geo = Math.min(1, norm(buzzMapCount, 5) * 0.7 + (buzzRadius > 0 ? 0.3 : 0));
  const discipline = norm(streak, 30) * 0.7 + (dailyCommit ? 0.3 : 0);
  const operational = norm(m1u, 500) * 0.5 + (dailyCommit ? 0.3 : 0) + norm(pe, 300) * 0.2;

  return {
    intelligence: Math.max(0, Math.min(1, intelligence)),
    geo: Math.max(0, Math.min(1, geo)),
    discipline: Math.max(0, Math.min(1, discipline)),
    operational: Math.max(0, Math.min(1, operational)),
  };
}

export function buildReportFromSnapshot(
  snapshot: MPESnapshot,
  delta: MPEDelta | null,
  userId?: string
): AgentPerformanceReport {
  if (snapshot.error) {
    return fallbackReport(delta?.delta_total ?? 0, delta?.insufficient_history ?? true);
  }

  const bars = dimensionScores(snapshot);

  // Weights: Intelligence 24%, Geo 28%, Discipline 28%, Operational 20%
  const scoreBase = 0.24 * bars.intelligence + 0.28 * bars.geo + 0.28 * bars.discipline + 0.2 * bars.operational;
  const scoreBasePct = scoreBase * 100;

  const dateKey = new Date().toISOString().slice(0, 10);
  const noise = dailyNoise(userId, dateKey);
  const percentage = clamp(scoreBasePct + noise);

  const state: 'low' | 'medium' | 'high' =
    percentage < 25 ? 'low' : percentage < 60 ? 'medium' : 'high';
  const confidence: 'low' | 'medium' | 'high' =
    state === 'high' ? 'high' : state === 'medium' ? 'medium' : 'low';

  const dailyDelta =
    delta?.insufficient_history || delta?.delta_total == null
      ? 0
      : typeof delta.delta_total === 'number'
        ? delta.delta_total
        : 0;

  return {
    percentage,
    state,
    stateLabelKey: STATE_LABELS[state],
    strengths: ['mission_profile_engine_strength_1', 'mission_profile_engine_strength_2'],
    weaknesses: ['mission_profile_engine_weakness_1'],
    priorityAction: {
      labelKey: 'mission_profile_engine_priority_action_example',
      expectedDeltaRange: [5, 9] as [number, number],
      actionId: 'buzz_map_reduce_area',
    },
    dailyDelta,
    confidenceBand: confidence,
    confidenceLabelKey: CONFIDENCE_LABELS[confidence],
    interferenceLineKey: 'mission_profile_engine_interference_line',
    bars,
  };
}

function fallbackReport(dailyDelta: number, insufficientHistory: boolean): AgentPerformanceReport {
  const percentage = 50;
  const state: 'low' | 'medium' | 'high' = 'medium';
  const confidence: 'low' | 'medium' | 'high' = 'low';
  return {
    percentage,
    state,
    stateLabelKey: STATE_LABELS[state],
    strengths: ['mission_profile_engine_strength_1', 'mission_profile_engine_strength_2'],
    weaknesses: ['mission_profile_engine_weakness_1'],
    priorityAction: {
      labelKey: 'mission_profile_engine_priority_action_example',
      expectedDeltaRange: [5, 9] as [number, number],
      actionId: 'buzz_map_reduce_area',
    },
    dailyDelta: insufficientHistory ? 0 : dailyDelta,
    confidenceBand: confidence,
    confidenceLabelKey: CONFIDENCE_LABELS[confidence],
    interferenceLineKey: 'mission_profile_engine_interference_line',
    bars: { intelligence: 0.5, geo: 0.5, discipline: 0.5, operational: 0.5 },
  };
}
