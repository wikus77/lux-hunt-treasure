// © 2025 Joseph MULÉ – M1SSION™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MarkerReward {
  reward_type: string;
  payload: any;
  description: string;
}

export const useMarkerRewards = () => {
  const [rewards, setRewards] = useState<MarkerReward[]>([]);
  const [claims, setClaims] = useState<{ marker_id: string; claimed_at: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchRewards = async (markerId: string | null) => {
    if (!markerId) {
      setRewards([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('marker_rewards')
        .select('reward_type, payload, description')
        .eq('marker_id', markerId);

      if (error) throw error;

      setRewards(data || []);
    } catch (err) {
      console.error('Error fetching marker rewards:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRewards([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('marker_claims')
        .select('marker_id, claimed_at')
        .order('claimed_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (err) {
      console.error('Error fetching claims:', err);
    }
  };

  useEffect(() => {
    refreshClaims();
  }, []);

  return { 
    rewards, 
    claims, 
    isLoading, 
    error, 
    fetchRewards,
    refreshClaims 
  };
};