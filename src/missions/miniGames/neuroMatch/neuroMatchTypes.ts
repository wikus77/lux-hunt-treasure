/**
 * Neuromatch Memory — daily mini-game types.
 * © 2025 Joseph MULÉ – M1SSION™
 */

export interface NeuroMatchGameParams {
  seed: string;
  week_index: number;
  time_limit_sec: number;
  mismatch_penalty_sec: number;
  cards_total: number;
  pairs_total: number;
  empty_slots: number;
  grid_cols: number;
  grid_rows: number;
  board_layout: number[];
}

export interface NeuroMatchOutcomePayload {
  seed: string;
  week_index: number;
  cards_total: number;
  pairs_total: number;
  matched_pairs: number;
  moves: number;
  mismatches: number;
  duration_ms: number;
  won: boolean;
}
