
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBuzzCounter = (userId: string | undefined) => {
  const [dailyBuzzCounter, setDailyBuzzCounter] = useState(0);

  // Load daily BUZZ counter for color calculation
  const loadDailyBuzzCounter = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading daily buzz counter:', error);
        return;
      }

      const buzzCount = data?.buzz_count || 0;
      setDailyBuzzCounter(buzzCount);
      console.log('📊 DYNAMIC COLOR - Daily buzz counter loaded:', buzzCount);
    } catch (err) {
      console.error('Exception loading daily buzz counter:', err);
    }
  }, [userId]);

  // Update daily BUZZ counter
  const updateDailyBuzzCounter = useCallback(async (): Promise<number> => {
    if (!userId) return 0;

    const newBuzzCounter = dailyBuzzCounter + 1;
    
    try {
      await supabase
        .from('user_buzz_counter')
        .upsert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          buzz_count: newBuzzCounter
        });
      
      setDailyBuzzCounter(newBuzzCounter);
      console.log('🎨 DYNAMIC COLOR - Updated buzz counter for color calculation:', newBuzzCounter);
      
      return newBuzzCounter;
    } catch (err) {
      console.error('Exception updating daily buzz counter:', err);
      return dailyBuzzCounter;
    }
  }, [userId, dailyBuzzCounter]);

  useEffect(() => {
    if (userId) {
      loadDailyBuzzCounter();
    }
  }, [userId, loadDailyBuzzCounter]);

  return {
    dailyBuzzCounter,
    loadDailyBuzzCounter,
    updateDailyBuzzCounter
  };
};
