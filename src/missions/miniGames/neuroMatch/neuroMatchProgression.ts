/**
 * Parse server progress into Neuromatch params.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import type { ClaimDailyPhaseResponse } from '@/missions/serverReal/claimDailyPhase';
import type { NeuroMatchGameParams } from './neuroMatchTypes';

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function parseNeuroMatchParams(
  progress: ClaimDailyPhaseResponse['progress'] | null | undefined
): NeuroMatchGameParams | null {
  if (!progress) return null;
  const p = progress as Record<string, unknown>;
  const seed = typeof p.seed === 'string' ? p.seed : '';
  const board_layout = Array.isArray(p.board_layout) ? (p.board_layout as unknown[]).map((x) => Number(x)) : null;
  if (!seed || !board_layout || board_layout.some((n) => !Number.isFinite(n))) return null;

  const week = num(p.week_index);
  const time_limit_sec = num(p.time_limit_sec) ?? 120;
  const mismatch_penalty_sec = num(p.mismatch_penalty_sec) ?? 4;
  const cards_total = num(p.cards_total);
  const pairs_total = num(p.pairs_total);
  const empty_slots = num(p.empty_slots);
  const grid_cols = num(p.grid_cols);
  const grid_rows = num(p.grid_rows);

  if (
    week == null ||
    cards_total == null ||
    pairs_total == null ||
    empty_slots == null ||
    grid_cols == null ||
    grid_rows == null
  ) {
    return null;
  }
  if (board_layout.length !== cards_total) return null;

  return {
    seed,
    week_index: week,
    time_limit_sec,
    mismatch_penalty_sec,
    cards_total,
    pairs_total,
    empty_slots,
    grid_cols,
    grid_rows,
    board_layout,
  };
}
