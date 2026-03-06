/**
 * Client for daily-mission-today Edge Function (Mission Cycle Engine — Opzione B)
 * © 2025 Joseph MULÉ – M1SSION™
 */

import { supabase } from '@/integrations/supabase/client';
import { getSessionSingleFlight } from '@/integrations/supabase/authSingleFlight';

export interface DailyMissionTodayResponse {
  ok: boolean;
  error?: string;
  day_key?: string;
  mission_id?: string;
  cycle_version?: string;
  index?: number;
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
