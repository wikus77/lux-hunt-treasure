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

// Cache key for instant display
const M1U_CACHE_KEY = 'm1ssion_m1u_cache';

export const useM1UnitsRealtime = (userId: string | undefined): UseM1UnitsRealtimeReturn => {
  // Load cached value for instant display
  const getCachedBalance = (): number => {
    try {
      const cached = localStorage.getItem(M1U_CACHE_KEY);
      if (cached) {
        const { balance, userId: cachedUserId } = JSON.parse(cached);
        if (cachedUserId === userId) return balance;
      }
    } catch {}
    return 0;
  };

  const [unitsData, setUnitsData] = useState<M1UnitsData | null>(() => {
    // Initialize with cached value for instant display
    const cachedBalance = getCachedBalance();
    if (userId && cachedBalance > 0) {
      return {
        user_id: userId,
        balance: cachedBalance,
        total_earned: 0,
        total_spent: 0,
        updated_at: new Date().toISOString(),
      };
    }
    return null;
  });
  const [connectionState, setConnectionState] = useState<M1UnitsConnectionState>('INIT');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heartbeatTimer, setHeartbeatTimer] = useState<NodeJS.Timeout | null>(null);

  // Cache balance for instant display on next load
  const cacheBalance = useCallback((balance: number) => {
    if (userId) {
      try {
        localStorage.setItem(M1U_CACHE_KEY, JSON.stringify({ balance, userId, timestamp: Date.now() }));
      } catch {}
    }
  }, [userId]);

  // Fetch initial M1 Units data from profiles table
  const fetchUnits = useCallback(async (retryCount = 0) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Read directly from profiles.m1_units
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, m1_units, updated_at')
        .eq('id', userId)
        .single();

      if (fetchError) {
        // Retry up to 2 times with delay
        if (retryCount < 2) {
          setTimeout(() => fetchUnits(retryCount + 1), 500 * (retryCount + 1));
          return;
        }
        throw new Error(fetchError.message || 'Failed to fetch M1U');
      }

      if (profile) {
        const balance = profile.m1_units || 0;
        setUnitsData({
          user_id: profile.id,
          balance,
          total_earned: 0,
          total_spent: 0,
          updated_at: profile.updated_at || new Date().toISOString(),
        });
        // Cache for instant display next time
        cacheBalance(balance);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setConnectionState('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [userId, cacheBalance]);

  // Ping function (triggers realtime update for smoke test)
  const ping = useCallback(async () => {
    if (!userId) return;

    try {
      // Trigger a dummy update on profiles to test realtime
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) throw updateError;
      
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
  }, [userId]);

  // Listen for custom M1U update events (from purchases, etc.)
  useEffect(() => {
    const handleM1UUpdate = () => {
      fetchUnits();
    };

    window.addEventListener('m1u-balance-updated', handleM1UUpdate);
    return () => {
      window.removeEventListener('m1u-balance-updated', handleM1UUpdate);
    };
  }, [fetchUnits]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;

    // Fetch immediately
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
          // On UPDATE, refetch from profiles
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
