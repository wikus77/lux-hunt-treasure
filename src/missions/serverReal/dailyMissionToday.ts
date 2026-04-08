/**
 * Client for daily-mission-today Edge Function (Mission Cycle Engine — Opzione B)
 * © 2025 Joseph MULÉ – M1SSION™
 */

import { supabase } from '@/integrations/supabase/client';
import { getSessionSingleFlight } from '@/integrations/supabase/authSingleFlight';

/** Phase 2: template_key from server (weekday-based archetype). */
export type DailyEngineTemplateKey =
  | 'intelligence'
  | 'skill'
  | 'field'
  | 'orientation'
  | 'time'
  | 'strategic'
  | 'special';

/** Phase 3: retention block from server. */
export interface DailyMissionRetention {
  streak: number;
  week_start: string;
  weekly_completion: boolean[];
  agent_status: 'ACTIVE' | 'INACTIVE';
  sunday_reward_available: boolean;
  /** When available, the Sunday day_key to pass to consume-sunday-reward (e.g. Monday we pass yesterday's Sunday). */
  sunday_reward_day_key?: string;
}

export interface DailyMissionTodayResponse {
  ok: boolean;
  error?: string;
  day_key?: string;
  mission_id?: string;
  /** Phase 2: archetype for display (e.g. intelligence, skill). */
  template_key?: DailyEngineTemplateKey;
  cycle_version?: string;
  index?: number;
  /** Optional: mini-games engine (pilot / future cycles). Client falls back to mission_id-only if absent. */
  game_type?: string;
  variant_key?: string;
  cycle_day_index?: number;
  /** Phase 3: retention (streak, weekly, agent, Sunday). */
  retention?: DailyMissionRetention;
  /** Tactical Tic-Tac-Toe meta (no correct_cell — server-only). */
  difficulty_level?: string;
  board_seed?: string;
  /** Sheep Herd meta (preview; authoritative params from start_phase1). */
  week_index?: number;
  seed?: string;
  /** Neuromatch Memory preview (authoritative board from start_phase1). */
  cards_total?: number;
  pairs_total?: number;
  empty_slots?: number;
  grid_cols?: number;
  grid_rows?: number;
}

export async function fetchDailyMissionToday(): Promise<DailyMissionTodayResponse> {
  const { data: { session } } = await getSessionSingleFlight();
  if (!session?.access_token) {
    return { ok: false, error: 'unauthorized' };
  }
  const { data, error } = await supabase.functions.invoke<DailyMissionTodayResponse>('daily-mission-today', {
    method: 'POST',
    body: {},
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
