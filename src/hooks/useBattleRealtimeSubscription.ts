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

export function useBattleRealtimeSubscription(battleId: string | null) {
  const [state, setState] = useState<BattleRealtimeState>({
    status: 'await_defense',
  });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!battleId) {
      setChannel(null);
      return;
    }

    console.debug('[Battle Realtime] Subscribing to TRON battle:', battleId);

    const battleChannel = supabase
      .channel(`battle:${battleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battles', // TRON Battle canonical table
          filter: `id=eq.${battleId}`,
        },
        (payload) => {
          console.debug('[Battle Realtime] TRON Battle update:', payload);
          const newData = payload.new as any;

          // Map TRON statuses to legacy state
          let mappedStatus: 'await_defense' | 'resolved' | 'cancelled' = 'await_defense';
          if (newData.status === 'resolved' || newData.status === 'expired') {
            mappedStatus = 'resolved';
          } else if (newData.status === 'cancelled') {
            mappedStatus = 'cancelled';
          } else if (newData.status === 'pending' || newData.status === 'accepted') {
            mappedStatus = 'await_defense';
          }

          setState((prev) => ({
            ...prev,
            status: mappedStatus,
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
          table: 'battle_audit', // TRON audit events
          filter: `battle_id=eq.${battleId}`,
        },
        (payload) => {
          console.debug('[Battle Realtime] TRON Audit event:', payload);
          const audit = payload.new as any;

          setState((prev) => ({
            ...prev,
            lastEvent: {
              type: audit.event_type as BattleEventType,
              payload: audit.payload,
            },
          }));
        }
      )
      .subscribe((status) => {
        console.debug('[Battle Realtime] Subscription status:', status);
      });

    setChannel(battleChannel);

    return () => {
      console.debug('[Battle Realtime] Unsubscribing from TRON battle:', battleId);
      battleChannel.unsubscribe();
    };
  }, [battleId]);

  return { state, channel };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
