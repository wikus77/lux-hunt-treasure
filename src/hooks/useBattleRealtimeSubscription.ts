// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type BattleEventType = 'attack_started' | 'defense_needed' | 'battle_resolved';

export interface BattleRealtimeState {
  status: 'await_defense' | 'resolved' | 'cancelled';
  winnerId?: string;
  until?: number; // ms epoch (expires_at)
  lastEvent?: {
    type: BattleEventType;
    payload: any;
  };
}

export function useBattleRealtimeSubscription(sessionId: string | null) {
  const [state, setState] = useState<BattleRealtimeState>({
    status: 'await_defense',
  });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setChannel(null);
      return;
    }

    console.debug('[Battle Realtime] Subscribing to battle:', sessionId);

    const battleChannel = supabase
      .channel(`battle:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.debug('[Battle Realtime] Session update:', payload);
          const newData = payload.new as any;

          setState((prev) => ({
            ...prev,
            status: newData.status,
            winnerId: newData.winner_id,
            until: newData.expires_at ? new Date(newData.expires_at).getTime() : undefined,
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_notifications',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.debug('[Battle Realtime] Notification event:', payload);
          const notification = payload.new as any;

          setState((prev) => ({
            ...prev,
            lastEvent: {
              type: notification.type,
              payload: notification.payload,
            },
          }));
        }
      )
      .subscribe((status) => {
        console.debug('[Battle Realtime] Subscription status:', status);
      });

    setChannel(battleChannel);

    return () => {
      console.debug('[Battle Realtime] Unsubscribing from battle:', sessionId);
      battleChannel.unsubscribe();
    };
  }, [sessionId]);

  return { state, channel };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
