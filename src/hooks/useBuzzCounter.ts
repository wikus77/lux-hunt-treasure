
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ BUZZ Counter Hook - Enhanced with Progressive Pricing

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateBuzzPrice, getBuzzDisplayPrice, getBuzzPriceCents } from '@/lib/constants/buzzPricing';
import { calculateBuzzCostM1U, getBuzzDisplayCostM1U } from '@/lib/constants/buzzPricingM1U';

export const useBuzzCounter = (userId: string | undefined) => {
  const [dailyBuzzCounter, setDailyBuzzCounter] = useState(0);

  // Load daily BUZZ counter for pricing calculation
  const loadDailyBuzzCounter = useCallback(async () => {
    if (!userId) return;

    const todayDate = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', userId)
        .eq('date', todayDate)
        .maybeSingle();

      // Silently handle expected errors (no rows, table issues)
      if (error && !['PGRST116', '42P01', '400'].includes(error.code)) {
        console.warn('[BuzzCounter] Query error:', error.code);
        return;
      }

      const buzzCount = data?.buzz_count || 0;
      setDailyBuzzCounter(buzzCount);
    } catch (err) {
      // Silent fallback - use 0
      setDailyBuzzCounter(0);
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
        }, { onConflict: 'user_id,date' });
      
      // Update state immediately
      setDailyBuzzCounter(newBuzzCounter);
      
      // Force reload from DB to ensure sync
      setTimeout(() => loadDailyBuzzCounter(), 100);
      
      return newBuzzCounter;
    } catch (err) {
      return dailyBuzzCounter;
    }
  }, [userId, dailyBuzzCounter, loadDailyBuzzCounter]);

  // Get current BUZZ pricing
  const getCurrentBuzzPrice = useCallback(() => {
    return calculateBuzzPrice(dailyBuzzCounter);
  }, [dailyBuzzCounter]);

  const getCurrentBuzzDisplayPrice = useCallback(() => {
    return getBuzzDisplayPrice(dailyBuzzCounter);
  }, [dailyBuzzCounter]);

  const getCurrentBuzzPriceCents = useCallback(() => {
    return getBuzzPriceCents(dailyBuzzCounter);
  }, [dailyBuzzCounter]);

  // M1U pricing functions
  const getCurrentBuzzCostM1U = useCallback(() => {
    return calculateBuzzCostM1U(dailyBuzzCounter);
  }, [dailyBuzzCounter]);

  const getCurrentBuzzDisplayCostM1U = useCallback(() => {
    return getBuzzDisplayCostM1U(dailyBuzzCounter);
  }, [dailyBuzzCounter]);

  // Reload counter when userId changes
  useEffect(() => {
    if (userId) {
      loadDailyBuzzCounter();
    }
  }, [userId, loadDailyBuzzCounter]);

  return {
    dailyBuzzCounter,
    loadDailyBuzzCounter,
    updateDailyBuzzCounter,
    getCurrentBuzzPrice,
    getCurrentBuzzDisplayPrice,
    getCurrentBuzzPriceCents,
    // M1U functions
    getCurrentBuzzCostM1U,
    getCurrentBuzzDisplayCostM1U
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
