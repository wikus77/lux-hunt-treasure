/**
 * Client for consume-sunday-reward Edge Function (Phase 3).
 * © 2025 Joseph MULÉ – M1SSION™
 */

import { supabase } from '@/integrations/supabase/client';
import { getSessionSingleFlight } from '@/integrations/supabase/authSingleFlight';

export interface ConsumeSundayRewardResponse {
  ok: boolean;
  error?: string;
  consumed?: boolean;
  already_consumed?: boolean;
}

export async function consumeSundayReward(dayKey: string): Promise<ConsumeSundayRewardResponse> {
  const { data: { session } } = await getSessionSingleFlight();
  if (!session?.access_token) {
    return { ok: false, error: 'unauthorized' };
  }
  const { data, error } = await supabase.functions.invoke<ConsumeSundayRewardResponse>(
    'consume-sunday-reward',
    {
      method: 'POST',
      body: { day_key: dayKey },
      headers: { Authorization: `Bearer ${session.access_token}` },
    }
  );
  if (error) {
    return { ok: false, error: error.message || 'invoke_failed' };
  }
  if (!data) {
    return { ok: false, error: 'no_data' };
  }
  return data;
}
