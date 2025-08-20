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
  const [dailyUsed, setDailyUsed] = useState(false); // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ

  const fetchGrants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ - Check if user has already consumed daily free BUZZ today
      const today = new Date().toISOString().split('T')[0];
      
      // Check user_buzz_counter for today's free BUZZ usage
      const { data: todayBuzzUsage, error: buzzError } = await supabase
        .from('user_buzz_counter')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('date', today)
        .single();

      // If any BUZZ was used today, mark daily as used
      if (todayBuzzUsage && todayBuzzUsage.buzz_count > 0) {
        setDailyUsed(true);
      } else {
        setDailyUsed(false);
      }

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
    // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ - Check daily limit first
    if (dailyUsed) {
      console.log('Daily free BUZZ already used');
      return false;
    }
    
    if (totalRemaining <= 0) return false;

    try {
      // Check one more time if already used today via database
      const today = new Date().toISOString().split('T')[0];
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { data: todayCheck } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (todayCheck && todayCheck.buzz_count > 0) {
        console.log('❌ Daily BUZZ already used - database check');
        setDailyUsed(true);
        return false;
      }

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

      // Mark daily usage immediately
      setDailyUsed(true);
      
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
    hasFreeBuzz: totalRemaining > 0 && !dailyUsed, // © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
    dailyUsed
  };
};