/**
 * The Pulse™ — Ritual Channel Hook
 * Subscribes to pulse:ritual realtime broadcasts for global ritual phases
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type RitualPhase = 'idle' | 'precharge' | 'blackout' | 'interference' | 'reveal' | 'closed';

export interface RitualBroadcast {
  phase: RitualPhase;
  ritual_id: number | null;
  at: string;
}

export function useRitualChannel() {
  const [phase, setPhase] = useState<RitualPhase>('idle');
  const [ritualId, setRitualId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('pulse:ritual')
      .on('broadcast', { event: 'ritual-phase' }, (payload) => {
        const data = payload.payload as RitualBroadcast;
        console.log('[Ritual] Phase broadcast:', data);
        setPhase(data.phase);
        setRitualId(data.ritual_id);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log('[Ritual] Channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, []);

  return { phase, ritualId, isConnected };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
