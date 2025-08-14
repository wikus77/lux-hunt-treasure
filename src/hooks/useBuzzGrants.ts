// © 2025 Joseph MULÉ – M1SSION™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BuzzGrant {
  id: string;
  source: string;
  remaining: number;
  created_at: string;
}

export const useBuzzGrants = () => {
  const [grants, setGrants] = useState<BuzzGrant[]>([]);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('buzz_grants')
        .select('*')
        .gt('remaining', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGrants(data || []);
      const total = (data || []).reduce((sum, grant) => sum + grant.remaining, 0);
      setTotalRemaining(total);
    } catch (err) {
      console.error('Error fetching buzz grants:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setGrants([]);
      setTotalRemaining(0);
    } finally {
      setIsLoading(false);
    }
  };

  const consumeFreeBuzz = async (): Promise<boolean> => {
    if (totalRemaining <= 0) return false;

    try {
      // Find the first grant with remaining buzz
      const grantToUse = grants.find(g => g.remaining > 0);
      if (!grantToUse) return false;

      const { error } = await supabase
        .from('buzz_grants')
        .update({ 
          remaining: grantToUse.remaining - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', grantToUse.id);

      if (error) throw error;

      // Refresh grants after consumption
      await fetchGrants();
      return true;
    } catch (err) {
      console.error('Error consuming free buzz:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  return {
    grants,
    totalRemaining,
    isLoading,
    error,
    fetchGrants,
    consumeFreeBuzz,
    hasFreeBuzz: totalRemaining > 0
  };
};