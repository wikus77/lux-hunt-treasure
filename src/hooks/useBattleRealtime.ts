/**
 * TRON BATTLE - Realtime Hook
 * Manages realtime battle channel subscriptions
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Battle {
  id: string;
  status: string;
  creator_id: string;
  opponent_id: string;
  stake_type: string;
  stake_amount: number;
  arena_name?: string;
  countdown_start_at?: string;
  flash_at?: string;
  winner_id?: string;
  creator_reaction_ms?: number;
  opponent_reaction_ms?: number;
}

interface UseBattleRealtimeProps {
  battleId: string | null;
  onBattleUpdate?: (battle: Battle) => void;
  onCountdownStart?: (countdown_start_at: string, flash_at: string) => void;
  onFlash?: () => void;
  onResolved?: (winnerId: string) => void;
}

export function useBattleRealtime({
  battleId,
  onBattleUpdate,
  onCountdownStart,
  onFlash,
  onResolved,
}: UseBattleRealtimeProps) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!battleId) return;

    const battleChannel = supabase.channel(`battle:${battleId}`, {
      config: { broadcast: { ack: true } },
    });

    battleChannel
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'battles',
        filter: `id=eq.${battleId}`,
      }, (payload) => {
        const battle = payload.new as Battle;
        onBattleUpdate?.(battle);

        // Handle state-specific callbacks
        if (battle.status === 'countdown' && battle.countdown_start_at && battle.flash_at) {
          onCountdownStart?.(battle.countdown_start_at, battle.flash_at);
        }

        if (battle.status === 'resolved' && battle.winner_id) {
          onResolved?.(battle.winner_id);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          console.log(`✅ Subscribed to battle:${battleId}`);
        } else if (status === 'CLOSED') {
          setConnected(false);
        }
      });

    setChannel(battleChannel);

    return () => {
      battleChannel.unsubscribe();
      setConnected(false);
    };
  }, [battleId, onBattleUpdate, onCountdownStart, onResolved]);

  const broadcast = useCallback(
    async (event: string, payload: any) => {
      if (!channel) return;
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    },
    [channel]
  );

  return { connected, broadcast };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
