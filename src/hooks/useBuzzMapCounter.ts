
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBuzzMapCounter = (userId?: string) => {
  const [dailyBuzzMapCounter, setDailyBuzzMapCounter] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load daily buzz map counter for current user
  const loadDailyBuzzMapCounter = useCallback(async () => {
    if (!userId) return;
    
    try {
      console.log('📊 Loading daily BUZZ MAPPA counter for user:', userId);
      
      const { data, error } = await supabase
        .from('user_buzz_map_counter')
        .select('buzz_map_count')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error loading buzz map counter:', error);
        return;
      }

      const currentCount = data?.buzz_map_count || 0;
      setDailyBuzzMapCounter(currentCount);
      
      console.log('✅ Daily BUZZ MAPPA counter loaded:', currentCount);
    } catch (err) {
      console.error('❌ Exception loading buzz map counter:', err);
    }
  }, [userId]);

  // Update daily buzz map counter
  const updateDailyBuzzMapCounter = useCallback(async (): Promise<number> => {
    if (!userId) return 0;
    
    setIsLoading(true);
    
    try {
      console.log('📊 Incrementing BUZZ MAPPA counter for user:', userId);
      
      const { data, error } = await supabase.rpc('increment_buzz_map_counter', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Error incrementing buzz map counter:', error);
        return dailyBuzzMapCounter;
      }

      const newCount = data || 0;
      setDailyBuzzMapCounter(newCount);
      
      console.log('✅ BUZZ MAPPA counter incremented to:', newCount);
      return newCount;
    } catch (err) {
      console.error('❌ Exception incrementing buzz map counter:', err);
      return dailyBuzzMapCounter;
    } finally {
      setIsLoading(false);
    }
  }, [userId, dailyBuzzMapCounter]);

  // Load counter on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadDailyBuzzMapCounter();
    }
  }, [userId, loadDailyBuzzMapCounter]);

  return {
    dailyBuzzMapCounter,
    isLoading,
    loadDailyBuzzMapCounter,
    updateDailyBuzzMapCounter
  };
};
