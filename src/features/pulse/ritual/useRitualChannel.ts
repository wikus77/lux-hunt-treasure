/**
 * The Pulse™ — Ritual Channel Hook
 * Subscribes to pulse:ritual realtime broadcasts for global ritual phases
 * Supports dual-channel: production ('prod') and test sandbox ('test')
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type RitualPhase = 'idle' | 'precharge' | 'blackout' | 'interference' | 'reveal' | 'closed';
export type RitualMode = 'prod' | 'test';

export interface RitualBroadcast {
  phase: RitualPhase;
  ritual_id: number | null;
  at: string;
}

export interface UseRitualChannelOptions {
  mode?: RitualMode;
}

export function useRitualChannel({ mode = 'prod' }: UseRitualChannelOptions = {}) {
  const [phase, setPhase] = useState<RitualPhase>('idle');
  const [ritualId, setRitualId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Select channel based on mode
    const channelName = mode === 'test' ? 'pulse:ritual:test' : 'pulse:ritual';
    
    console.log(`[Ritual] Subscribing to channel: ${channelName}`);

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'ritual-phase' }, (payload) => {
        const data = payload.payload as RitualBroadcast;
        console.log(`[Ritual ${mode}] Phase broadcast:`, data);
        setPhase(data.phase);
        setRitualId(data.ritual_id);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log(`[Ritual ${mode}] Channel status:`, status);
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [mode]);

  return { phase, ritualId, isConnected, mode };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
