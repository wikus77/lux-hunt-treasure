/**
 * M1 UNITS™ — Realtime Hook
 * Subscribe to user M1 Units balance updates via Supabase Realtime
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { emitSubscribed, emitError } from '@/lib/realtime/reconnectBus';

export interface M1UnitsData {
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
}

export type M1UnitsConnectionState = 'INIT' | 'CONNECTING' | 'SUBSCRIBED' | 'HEARTBEAT' | 'ERROR' | 'CLOSED';

interface UseM1UnitsRealtimeReturn {
  unitsData: M1UnitsData | null;
  connectionState: M1UnitsConnectionState;
  isLoading: boolean;
  error: string | null;
  ping: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useM1UnitsRealtime = (userId: string | undefined): UseM1UnitsRealtimeReturn => {
  const [unitsData, setUnitsData] = useState<M1UnitsData | null>(null);
  const [connectionState, setConnectionState] = useState<M1UnitsConnectionState>('INIT');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heartbeatTimer, setHeartbeatTimer] = useState<NodeJS.Timeout | null>(null);

  // Fetch initial M1 Units data from profiles.m1_units
  const fetchUnits = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Read from profiles.m1_units (CORRECT SCHEMA)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('m1_units, nickname, pulse_energy')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error(profileError.message || 'Failed to fetch profile');
      }

      if (profile) {
        setUnitsData({
          user_id: userId,
          balance: profile.m1_units || 0,
          total_earned: 0,
          total_spent: 0,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setConnectionState('ERROR');
      // Only log in dev
      if (import.meta.env.DEV) {
        console.warn('[M1U] Fetch error:', errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Ping function (triggers realtime update for smoke test)
  const ping = useCallback(async () => {
    if (!userId) return;

    try {
      // Simply refetch data to simulate ping
      await fetchUnits();
      
      // Heartbeat received
      setConnectionState('HEARTBEAT');
      
      // Reset to SUBSCRIBED after 2s
      setTimeout(() => {
        setConnectionState('SUBSCRIBED');
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ping failed';
      setError(errorMsg);
      setConnectionState('ERROR');
      if (import.meta.env.DEV) {
        console.warn('[M1U] Ping error:', errorMsg);
      }
    }
  }, [userId, fetchUnits]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;

    fetchUnits();
    setConnectionState('CONNECTING');

    const channelName = `m1_units_user_${userId}`;
    
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
          // On UPDATE to profiles.m1_units, refetch data
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
          emitSubscribed(channelName);
          
          // Start heartbeat check (every 30s)
          const timer = setInterval(() => {
            setConnectionState(prev => prev === 'SUBSCRIBED' ? 'SUBSCRIBED' : prev);
          }, 30000);
          setHeartbeatTimer(timer);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionState('ERROR');
          emitError(String(status), channelName);
        } else if (status === 'CLOSED') {
          setConnectionState('CLOSED');
        }
      });

    return () => {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
      }
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
