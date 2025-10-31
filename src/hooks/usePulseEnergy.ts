// Hook compatibilità: Bridge XP → Pulse Energy (PE) + Rank System
import { useState, useEffect, useMemo } from 'react';
import { useXpSystem } from './useXpSystem';
import { supabase } from '@/integrations/supabase/client';

export interface AgentRank {
  id: number;
  code: string;
  name_it: string;
  name_en: string;
  description: string;
  pe_min: number;
  pe_max: number | null;
  color: string;
  symbol: string;
}

interface UsePulseEnergyReturn {
  pulseEnergy: number;
  currentRank: AgentRank | null;
  nextRank: AgentRank | null;
  progressToNextRank: number; // 0-100
  buzzCredits: number;
  buzzMapCredits: number;
  loading: boolean;
  hasNewRewards: boolean;
  consumeCredit: (creditType: 'buzz' | 'buzz_map') => Promise<boolean>;
  refreshPulseEnergy: () => void;
  markRewardsAsSeen: () => void;
  ranksAvailable: boolean;
}

/**
 * Pulse Energy + Rank System Hook
 * Wrapper di useXpSystem() che espone PE + Gerarchia v2.0
 * Mantiene retrocompatibilità con XP legacy
 * CRITICAL FIX: Legge rank_id direttamente da profiles per MCP
 */
export const usePulseEnergy = (): UsePulseEnergyReturn => {
  const xpSystem = useXpSystem();
  const [ranks, setRanks] = useState<AgentRank[]>([]);
  const [ranksLoading, setRanksLoading] = useState(true);
  const [userRankId, setUserRankId] = useState<number | null>(null);

  // Fetch agent ranks catalog (cached)
  useEffect(() => {
    const fetchRanks = async () => {
      try {
        // Type-safe query: use generic from() until agent_ranks is in types
        const { data, error } = await supabase
          .from('agent_ranks' as any)
          .select('*')
          .order('pe_min', { ascending: true });

        if (error) {
          console.warn('[usePulseEnergy] Failed to fetch ranks:', error.message);
          setRanks([]);
        } else if (data) {
          setRanks(data as unknown as AgentRank[]);
        }
      } catch (err) {
        console.error('[usePulseEnergy] Exception fetching ranks:', err);
        setRanks([]);
      } finally {
        setRanksLoading(false);
      }
    };

    fetchRanks();
  }, []);

  // CRITICAL: Fetch user's assigned rank_id from profiles (for MCP override)
  useEffect(() => {
    const fetchUserRank = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('rank_id')
          .eq('id', session.user.id)
          .single();

        if (!error && data?.rank_id) {
          setUserRankId(data.rank_id);
          console.log('[usePulseEnergy] User rank_id from DB:', data.rank_id);
        }
      } catch (err) {
        console.error('[usePulseEnergy] Error fetching user rank:', err);
      }
    };

    fetchUserRank();
  }, []);

  // Bridge: XP → PE (alias until backend migration completes)
  const pulseEnergy = xpSystem.xpStatus.total_xp;

  // Calculate current rank based on rank_id (priority) or PE fallback
  const currentRank = useMemo(() => {
    if (ranks.length === 0) return null;

    // PRIORITY: If user has assigned rank_id (e.g., MCP), use that
    if (userRankId !== null) {
      const assignedRank = ranks.find(r => r.id === userRankId);
      if (assignedRank) {
        console.log('[usePulseEnergy] Using assigned rank_id:', assignedRank.code);
        return assignedRank;
      }
    }

    // FALLBACK: Calculate rank from PE for normal users
    for (let i = ranks.length - 1; i >= 0; i--) {
      const rank = ranks[i];
      if (pulseEnergy >= rank.pe_min) {
        if (rank.pe_max === null || pulseEnergy < rank.pe_max) {
          return rank;
        }
      }
    }

    // Last resort: first rank (Recruit)
    return ranks[0] || null;
  }, [ranks, pulseEnergy, userRankId]);

  // Calculate next rank
  const nextRank = useMemo(() => {
    if (!currentRank || ranks.length === 0) return null;

    const currentIndex = ranks.findIndex(r => r.id === currentRank.id);
    if (currentIndex === -1 || currentIndex === ranks.length - 1) return null;

    return ranks[currentIndex + 1];
  }, [ranks, currentRank]);

  // Calculate progress to next rank (0-100)
  const progressToNextRank = useMemo(() => {
    if (!currentRank || !nextRank) return 100; // Max rank

    const rangeSize = nextRank.pe_min - currentRank.pe_min;
    const progressInRange = pulseEnergy - currentRank.pe_min;
    
    return Math.min(100, Math.max(0, (progressInRange / rangeSize) * 100));
  }, [currentRank, nextRank, pulseEnergy]);

  return {
    pulseEnergy,
    currentRank,
    nextRank,
    progressToNextRank,
    buzzCredits: xpSystem.xpStatus.free_buzz_credit,
    buzzMapCredits: xpSystem.xpStatus.free_buzz_map_credit,
    loading: xpSystem.loading || ranksLoading,
    hasNewRewards: xpSystem.hasNewRewards,
    consumeCredit: xpSystem.consumeCredit,
    refreshPulseEnergy: xpSystem.refreshXpStatus,
    markRewardsAsSeen: xpSystem.markRewardsAsSeen,
    ranksAvailable: ranks.length > 0,
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
