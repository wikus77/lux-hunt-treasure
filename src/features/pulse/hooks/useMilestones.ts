/**
 * THE PULSE™ — Milestones Hook
 * Hook per gestire i traguardi PE dell'agente
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface Milestone {
  id: number;
  pe_threshold: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  reward_type: string;
  reward_value: {
    amount?: number;
    m1u?: number;
    badge_id?: string;
    multiplier?: number;
    duration_days?: number;
    feature?: string;
  };
  claimed: boolean;
  reachable: boolean;
}

export interface NextMilestone {
  id: number;
  pe_threshold: number;
  pe_remaining: number;
  title: string;
  icon: string;
  color: string;
}

export interface MilestoneStatus {
  currentPE: number;
  milestones: Milestone[];
  claimedCount: number;
  totalCount: number;
  nextMilestone: NextMilestone | null;
}

interface UseMilestonesReturn {
  status: MilestoneStatus | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useMilestones = (): UseMilestonesReturn => {
  const { user } = useAuth();
  const [status, setStatus] = useState<MilestoneStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('rpc_get_milestone_status', {
        p_user_id: user.id
      });

      if (rpcError) throw rpcError;

      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        
        setStatus({
          currentPE: parsed.current_pe || 0,
          milestones: parsed.milestones || [],
          claimedCount: parsed.claimed_count || 0,
          totalCount: parsed.total_count || 0,
          nextMilestone: parsed.next_milestone ? {
            id: parsed.next_milestone.id,
            pe_threshold: parsed.next_milestone.pe_threshold,
            pe_remaining: parsed.next_milestone.pe_remaining,
            title: parsed.next_milestone.title,
            icon: parsed.next_milestone.icon,
            color: parsed.next_milestone.color,
          } : null,
        });
      }
    } catch (err) {
      console.error('❌ useMilestones error:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Listen for milestone claim events
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`milestones_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pulse_milestone_claims',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('🎯 Milestone claimed! Refetching...');
          fetchStatus();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, fetchStatus]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

