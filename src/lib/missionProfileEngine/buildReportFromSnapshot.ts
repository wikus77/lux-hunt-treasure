/**
 * MISSION PROFILE ENGINE™ — Build AgentPerformanceReport from RPC snapshot + delta.
 * Same type as fakeReport; real data from mpe_get_inputs_snapshot + mpe_get_daily_delta.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
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
  global_rank?: number | null;
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

/** Normalize 0..1 from value and optional max (default 100) */
function norm(value: number, max = 100): number {
  return Math.max(0, Math.min(1, value / max));
}

/**
 * Build report from snapshot and delta. Uses snapshot for inputs and delta for dailyDelta.
 */
export function buildReportFromSnapshot(
  snapshot: MPESnapshot,
  delta: MPEDelta | null
): AgentPerformanceReport {
  if (snapshot.error) {
    return fallbackReport(delta?.delta_total ?? 0, delta?.insufficient_history ?? true);
  }

  const clues = snapshot.clues_count ?? 0;
  const buzzMapCount = snapshot.buzz_map_count_this_week ?? 0;
  const buzzRadius = snapshot.buzz_map_radius_km ?? 0;
  const streak = snapshot.current_streak_days ?? 0;
  const rank = snapshot.global_rank != null ? Number(snapshot.global_rank) : null;
  const pe = snapshot.pulse_energy ?? 0;
  const dailyCommit = snapshot.daily_commit_completed_today ?? false;

  // Composite score 0..100 for percentage (weights arbitrary but stable)
  const intelligenceScore = norm(clues, 200) * 30 + norm(pe, 500) * 20;
  const geoScore = norm(buzzMapCount, 5) * 25 + (buzzRadius > 0 ? 15 : 0);
  const disciplineScore = norm(streak, 30) * 40 + (dailyCommit ? 20 : 0);
  const operationalScore = rank != null ? (rank <= 10 ? 50 : rank <= 50 ? 35 : norm(1000 - rank, 1000) * 30) : 15;

  const bars = {
    intelligence: norm(intelligenceScore, 50),
    geo: norm(geoScore, 40),
    discipline: norm(disciplineScore, 60),
    operational: norm(operationalScore, 50),
  };

  const totalScore = (bars.intelligence + bars.geo + bars.discipline + bars.operational) / 4;
  const percentage = clamp(totalScore * 95 + 5);

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
