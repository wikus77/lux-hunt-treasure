// @ts-nocheck
/**
 * THE PULSE™ — Realtime Hook
 * Hook per sottoscrivere lo stato globale del Pulse via Supabase Realtime
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { emitReconnecting, emitSubscribed, emitError } from '@/lib/realtime/reconnectBus';

export interface PulseState {
  value: number; // 0-100
  last_threshold: number; // 0/25/50/75/100
  updated_at: string;
}

export interface PulseRealtimePayload {
  value: number;
  delta: number;
  threshold: number | null;
  type?: 'decay';
}

interface UsePulseRealtimeReturn {
  pulseState: PulseState | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdate: PulseRealtimePayload | null;
  refetch: () => Promise<void>;
}

export const usePulseRealtime = (): UsePulseRealtimeReturn => {
  const [pulseState, setPulseState] = useState<PulseState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<PulseRealtimePayload | null>(null);
  const channelRef = useRef<any>(null);
  const lastUpdateTime = useRef<number>(0);

  // Fetch initial state
  const fetchState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('rpc_pulse_state_read');

      if (rpcError) throw rpcError;

      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        setPulseState(parsed);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    fetchState();

    // Subscribe to pulse_state table changes
    const stateChannel = supabase
      .channel('pulse_state_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pulse_state',
        },
        (payload) => {
          const newRow = payload.new as PulseState;
          setPulseState(newRow);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          emitSubscribed('pulse_state_changes');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          emitError(String(status), 'pulse_state_changes');
        }
      });

    // Subscribe to custom pulse_channel notifications
    const notifyChannel = supabase
      .channel('pulse_notifications')
      .on('broadcast', { event: 'pulse_update' }, (payload) => {
        // Throttle updates to max 10/s
        const now = Date.now();
        if (now - lastUpdateTime.current < 100) return;
        lastUpdateTime.current = now;

        setLastUpdate(payload.payload as PulseRealtimePayload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          emitSubscribed('pulse_notifications');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          emitError(String(status), 'pulse_notifications');
        }
      });

    channelRef.current = { stateChannel, notifyChannel };

    return () => {
      stateChannel.unsubscribe();
      notifyChannel.unsubscribe();
    };
  }, [fetchState]);

  return {
    pulseState,
    isLoading,
    error,
    lastUpdate,
    refetch: fetchState,
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
