/**
 * M1 UNITS™ — Profile-based Hook
 * Direct integration with profiles.m1_units column
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface M1UnitsData {
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
}

export type M1UnitsConnectionState = 'INIT' | 'CONNECTING' | 'SUBSCRIBED' | 'HEARTBEAT' | 'ERROR' | 'CLOSED';

interface UseM1UnitsProfileReturn {
  unitsData: M1UnitsData | null;
  connectionState: M1UnitsConnectionState;
  isLoading: boolean;
  error: string | null;
  ping: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useM1UnitsProfile = (userId: string | undefined): UseM1UnitsProfileReturn => {
  const [unitsData, setUnitsData] = useState<M1UnitsData | null>(null);
  const [connectionState, setConnectionState] = useState<M1UnitsConnectionState>('INIT');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch M1 Units from profiles.m1_units
  const fetchUnits = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, m1_units')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error(profileError.message || 'Failed to fetch M1U from profile');
      }

      if (profile) {
        setUnitsData({
          user_id: profile.id,
          balance: profile.m1_units || 0,
          total_earned: 0, // Not tracked in profiles table
          total_spent: 0,  // Not tracked in profiles table
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setConnectionState('ERROR');
      if (import.meta.env.DEV) {
        console.warn('[M1U Profile] Fetch error:', errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Ping function (just refetches data for UI feedback)
  const ping = useCallback(async () => {
    if (!userId) return;

    try {
      setConnectionState('HEARTBEAT');
      await fetchUnits();
      setTimeout(() => {
        setConnectionState('SUBSCRIBED');
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ping failed';
      setError(errorMsg);
      setConnectionState('ERROR');
      if (import.meta.env.DEV) {
        console.warn('[M1U Profile] Ping error:', errorMsg);
      }
    }
  }, [userId, fetchUnits]);

  // Subscribe to realtime updates on profiles table
  useEffect(() => {
    if (!userId) return;

    fetchUnits();
    setConnectionState('CONNECTING');

    const channelName = `m1_units_profile_${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        async (payload) => {
          // On UPDATE, refetch profile data
          await fetchUnits();
          
          // Trigger heartbeat visual feedback
          setConnectionState('HEARTBEAT');
          setTimeout(() => {
            setConnectionState('SUBSCRIBED');
          }, 1000);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionState('SUBSCRIBED');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionState('ERROR');
        } else if (status === 'CLOSED') {
          setConnectionState('CLOSED');
        }
      });

    return () => {
      channel.unsubscribe();
      setConnectionState('INIT');
    };
  }, [userId, fetchUnits]);

  return {
    unitsData,
    connectionState,
    isLoading,
    error,
    ping,
    refetch: fetchUnits,
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
