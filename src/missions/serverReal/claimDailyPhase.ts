/**
 * Client for claim-daily-phase Edge Function (Daily Missions server-real)
 * © 2025 Joseph MULÉ – M1SSION™
 */

import { supabase } from '@/integrations/supabase/client';
import { getSessionSingleFlight } from '@/integrations/supabase/authSingleFlight';

export type ClaimAction = 'start_phase1' | 'complete_phase1' | 'start_phase2' | 'complete_phase2';

export interface ClaimDailyPhaseResponse {
  ok: boolean;
  error?: string;
  phase?: number;
  status?: string;
  progress?: {
    anagram?: string;
    targetWord?: string;
    target_angle?: number;
    tolerance_deg?: number;
    rounds?: { round: number; left: string; right: string }[];
    sequence_shown?: number[];
    pattern_type?: string;
    /** Tactical Tic-Tac-Toe: 9 cells, null = empty (JSON null). */
    board?: (string | null)[];
    difficulty?: string;
    board_seed?: string;
    seed?: string;
    week_index?: number;
    time_limit_sec?: number;
    sheep_total?: number;
    required_in_pen?: number;
    max_lost?: number;
    scare_radius_mul?: number;
    pen_radius_mul?: number;
    sheep_speed_mul?: number;
    mismatch_penalty_sec?: number;
    cards_total?: number;
    pairs_total?: number;
    empty_slots?: number;
    grid_cols?: number;
    grid_rows?: number;
    board_layout?: number[];
  };
  reward_awarded?: boolean;
  amount?: number;
  amount_pe?: number;
  result?: 'win' | 'fail';
  savedWords?: string[];
  next_available_at?: string | null;
}

export const MISSION_ID_CIPHER_DRILL = 'cipher_drill_anagram_v1';
export const MISSION_ID_WORD_DUEL = 'word_duel_memory_v1';
export const MISSION_ID_SIGNAL_PATTERN = 'signal_pattern_numbers_v1';
/** Pilot daily mini game (allowlist + DAILY_MINI_GAMES_PILOT_ENABLED on edge). */
export const MISSION_ID_DMG_V1_D01_PIN_ROTATOR = 'dmg_v1_d01';
export const GAME_TYPE_PIN_ROTATOR_TIMING = 'pin_rotator_timing';
export const MISSION_ID_TACTICAL_TIC_TAC_TOE = 'tactical_tic_tac_toe_v1';
export const GAME_TYPE_TIC_TAC_TOE = 'tic_tac_toe';
export const MISSION_ID_SHEEP_HERD_V1 = 'sheep_herd_v1';
export const GAME_TYPE_SHEEP_HERD = 'sheep_herd';
export const MISSION_ID_NEUROMATCH_MEMORY_V1 = 'neuromatch_memory_v1';
export const GAME_TYPE_NEURO_MATCH = 'neuro_match';

export async function claimDailyPhase(
  action: ClaimAction,
  missionId: string,
  payload?: Record<string, unknown>
): Promise<ClaimDailyPhaseResponse> {
  const { data: { session } } = await getSessionSingleFlight();
  if (!session?.access_token) {
    return { ok: false, error: 'unauthorized' };
  }
  const { data, error } = await supabase.functions.invoke<ClaimDailyPhaseResponse>('claim-daily-phase', {
    body: { action, mission_id: missionId, payload: payload ?? {} },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error) {
    const bodyErr = data && typeof data === 'object' && typeof data.error === 'string' ? data.error : undefined;
    return { ok: false, error: bodyErr || error.message || 'invoke_failed' };
  }
  if (!data) {
    return { ok: false, error: 'no_data' };
  }
  return data;
}
