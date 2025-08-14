// © 2025 Joseph MULÉ – M1SSION™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MarkerReward {
  reward_type: string;
  payload: any;
  description: string;
}

export const useMarkerRewards = (markerId: string | null) => {
  const [rewards, setRewards] = useState<MarkerReward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!markerId) {
      setRewards([]);
      return;
    }

    const fetchRewards = async () => {
      setIsLoading(true);
      setError(null);

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

    fetchRewards();
  }, [markerId]);

  return { rewards, isLoading, error };
};