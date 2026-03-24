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
    rounds?: { round: number; left: string; right: string }[];
    sequence_shown?: number[];
    pattern_type?: string;
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
    return { ok: false, error: error.message || 'invoke_failed' };
  }
  if (!data) {
    return { ok: false, error: 'no_data' };
  }
  return data;
}
