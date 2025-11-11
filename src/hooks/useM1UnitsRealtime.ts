/**
 * M1 UNITS™ — Realtime Hook
 * Subscribe to user M1 Units balance updates via Supabase Realtime
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { emitSubscribed, emitError } from '@/lib/realtime/reconnectBus';

export interface M1UnitsData {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  last_updated: string;
  created_at: string;
}

export type M1UnitsConnectionState = 'INIT' | 'CONNECTING' | 'SUBSCRIBED' | 'HEARTBEAT' | 'ERROR' | 'CLOSED';

interface UseM1UnitsRealtimeReturn {
  unitsData: M1UnitsData | null;
  connectionState: M1UnitsConnectionState;
  isLoading: boolean;
  error: Error | null;
  ping: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useM1UnitsRealtime = (userId: string | undefined): UseM1UnitsRealtimeReturn => {
  const [unitsData, setUnitsData] = useState<M1UnitsData | null>(null);
  const [connectionState, setConnectionState] = useState<M1UnitsConnectionState>('INIT');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [heartbeatTimer, setHeartbeatTimer] = useState<NodeJS.Timeout | null>(null);

  // Fetch initial M1 Units data using RPC
  const fetchUnits = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use RPC m1u_get_summary() for complete data
      const { data: summary, error: rpcError } = await (supabase as any)
        .rpc('m1u_get_summary');

      if (rpcError) {
        // If no record exists, create one via RPC ping
        if (rpcError.code === 'PGRST116' || rpcError.message?.includes('no rows')) {
          await (supabase as any).rpc('m1u_ping');
          
          // Refetch after creation
          const { data: newSummary, error: refetchError } = await (supabase as any)
            .rpc('m1u_get_summary');

          if (refetchError) throw refetchError;
          
          // Build M1UnitsData from summary
          if (newSummary) {
            setUnitsData({
              id: userId,
              user_id: userId,
              balance: newSummary.balance || 0,
              total_earned: newSummary.total_earned || 0,
              total_spent: newSummary.total_spent || 0,
              last_updated: new Date().toISOString(),
              created_at: new Date().toISOString(),
            } as M1UnitsData);
          }
        } else {
          throw rpcError;
        }
      } else if (summary) {
        // Build M1UnitsData from summary
        setUnitsData({
          id: userId,
          user_id: userId,
          balance: summary.balance || 0,
          total_earned: summary.total_earned || 0,
          total_spent: summary.total_spent || 0,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString(),
        } as M1UnitsData);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Ping function (triggers realtime update for smoke test)
  const ping = useCallback(async () => {
    if (!userId) return;

    try {
      // Call without arguments - RPC defaults to auth.uid()
      const { data, error: pingError } = await (supabase as any).rpc('m1u_ping');

      if (pingError) throw pingError;
      
      // Heartbeat received
      setConnectionState('HEARTBEAT');
      
      // Reset to SUBSCRIBED after 2s
      setTimeout(() => {
        setConnectionState('SUBSCRIBED');
      }, 2000);
    } catch (err) {
      setError(err as Error);
      setConnectionState('ERROR');
    }
  }, [userId]);

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
          event: '*',
          schema: 'public',
          table: 'user_m1_units',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newData = payload.new as M1UnitsData;
            setUnitsData(newData);
            
            // Trigger heartbeat visual feedback
            setConnectionState('HEARTBEAT');
            setTimeout(() => {
              setConnectionState('SUBSCRIBED');
            }, 1000);
          }
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
