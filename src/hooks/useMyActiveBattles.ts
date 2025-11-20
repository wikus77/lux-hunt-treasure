// @ts-nocheck
/**
 * My Active Battles Hook - Tracks user's active TRON battles
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Battle } from '@/types/battle';

interface UseMyActiveBattlesReturn {
  activeBattles: Battle[];
  pendingChallenges: Battle[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMyActiveBattles(userId: string | null): UseMyActiveBattlesReturn {
  const [activeBattles, setActiveBattles] = useState<Battle[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBattles = async () => {
    if (!userId) {
      setActiveBattles([]);
      setPendingChallenges([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch active battles (where user is creator or opponent)
      const { data: active, error: activeError } = await supabase
        .from('battles')
        .select('*')
        .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
        .in('status', ['accepted', 'ready', 'countdown', 'active'])
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      // Fetch pending challenges (where user is opponent and status is pending)
      const { data: pending, error: pendingError } = await supabase
        .from('battles')
        .select('*')
        .eq('opponent_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      setActiveBattles((active || []) as Battle[]);
      setPendingChallenges((pending || []) as Battle[]);
    } catch (err) {
      console.error('[useMyActiveBattles] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBattles();

    // Subscribe to battles table for realtime updates
    const channel = supabase
      .channel(`my-battles-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battles',
          filter: `creator_id=eq.${userId}`,
        },
        () => fetchBattles()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battles',
          filter: `opponent_id=eq.${userId}`,
        },
        () => fetchBattles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    activeBattles,
    pendingChallenges,
    loading,
    error,
    refetch: fetchBattles,
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
