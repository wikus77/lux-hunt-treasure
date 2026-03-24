/**
 * Read-only pending battle count for Home floating pill badge (mirrors BattleConsole filter).
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useBattlePendingCount(userId: string | undefined): number {
  const [count, setCount] = useState(0);

  const load = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('id')
        .eq('opponent_id', uid)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false });

      if (!error && data) setCount(data.length);
      else setCount(0);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }
    load(userId);
  }, [userId, load]);

  return count;
}
