/**
 * THE PULSE™ — Agent Energy Hook
 * Hook per leggere l'energia personale dell'agente (pulse_energy) + rank
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface AgentRank {
  id: number;
  code: string;
  name_en: string;
  name_it: string;
  description: string;
  pe_min: number;
  pe_max: number | null;
  color: string;
  symbol: string;
}

export interface AgentEnergyState {
  pulseEnergy: number;
  rank: AgentRank | null;
  nextRank: AgentRank | null;
  progressToNextRank: number; // 0-100%
  peToNextRank: number; // PE mancanti per il prossimo rank
}

interface UseAgentEnergyReturn {
  energy: AgentEnergyState | null;
  isLoading: boolean;
  error: Error | null;
  lastDelta: number | null; // Ultimo incremento PE (per animazioni)
  refetch: () => Promise<void>;
}

export const useAgentEnergy = (): UseAgentEnergyReturn => {
  const { user } = useAuth();
  const [energy, setEnergy] = useState<AgentEnergyState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastDelta, setLastDelta] = useState<number | null>(null);
  const channelRef = useRef<any>(null);
  const previousPE = useRef<number>(0);

  // Fetch all ranks for reference
  const fetchRanks = useCallback(async (): Promise<AgentRank[]> => {
    const { data, error } = await supabase
      .from('agent_ranks')
      .select('*')
      .order('pe_min', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }, []);

  // Calculate progress to next rank
  const calculateProgress = (
    currentPE: number,
    currentRank: AgentRank | null,
    nextRank: AgentRank | null
  ): { progress: number; peToNext: number } => {
    if (!currentRank || !nextRank) {
      return { progress: 100, peToNext: 0 }; // Max rank reached
    }

    const rangeStart = currentRank.pe_min;
    const rangeEnd = nextRank.pe_min;
    const peInRange = currentPE - rangeStart;
    const totalRange = rangeEnd - rangeStart;

    const progress = Math.min(100, Math.max(0, (peInRange / totalRange) * 100));
    const peToNext = Math.max(0, rangeEnd - currentPE);

    return { progress, peToNext };
  };

  // Main fetch function
  const fetchEnergy = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch profile with rank info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          pulse_energy,
          rank_id,
          agent_ranks:rank_id (
            id, code, name_en, name_it, description, pe_min, pe_max, color, symbol
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch all ranks to find next rank
      const allRanks = await fetchRanks();
      
      const currentPE = profile?.pulse_energy || 0;
      const currentRank = profile?.agent_ranks as AgentRank | null;
      
      // Find next rank
      const nextRank = allRanks.find(r => 
        r.pe_min > currentPE && r.code !== 'SRC-∞'
      ) || null;

      const { progress, peToNext } = calculateProgress(currentPE, currentRank, nextRank);

      // Calculate delta if PE changed
      if (previousPE.current > 0 && currentPE !== previousPE.current) {
        const delta = currentPE - previousPE.current;
        if (delta > 0) {
          setLastDelta(delta);
          // Clear delta after animation time
          setTimeout(() => setLastDelta(null), 3000);
        }
      }
      previousPE.current = currentPE;

      setEnergy({
        pulseEnergy: currentPE,
        rank: currentRank,
        nextRank,
        progressToNextRank: progress,
        peToNextRank: peToNext,
      });
    } catch (err) {
      console.error('❌ useAgentEnergy error:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, fetchRanks]);

  // Initial fetch
  useEffect(() => {
    fetchEnergy();
  }, [fetchEnergy]);

  // Realtime subscription for pulse_energy changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`agent_energy_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newPE = payload.new.pulse_energy;
          const oldPE = previousPE.current;
          
          if (newPE !== oldPE) {
            console.log(`⚡ PE Update: ${oldPE} → ${newPE} (+${newPE - oldPE})`);
            fetchEnergy(); // Refetch to get updated rank info
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Agent energy realtime subscribed');
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, fetchEnergy]);

  return {
    energy,
    isLoading,
    error,
    lastDelta,
    refetch: fetchEnergy,
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

