
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
    if (!userId) {
      console.log('🔍 BUZZ COUNTER DEBUG: No userId, skipping load');
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    console.log('🔍 BUZZ COUNTER DEBUG: Loading counter', { userId, todayDate });

    try {
      const { data, error } = await supabase
        .from('user_buzz_counter')
        .select('daily_count')
        .eq('user_id', userId)
        .eq('counter_date', todayDate)
        .maybeSingle();

      console.log('🔍 BUZZ COUNTER DEBUG: Query result', { data, error });

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ BUZZ COUNTER ERROR: Failed to load', error);
        return;
      }

      const buzzCount = data?.daily_count || 0;
      setDailyBuzzCounter(buzzCount);
      console.log('✅ BUZZ COUNTER: Loaded successfully', { 
        buzzCount, 
        nextClickPrice: calculateBuzzPrice(buzzCount),
        nextClickCostM1U: calculateBuzzCostM1U(buzzCount)
      });
    } catch (err) {
      console.error('❌ BUZZ COUNTER EXCEPTION:', err);
    }
  }, [userId]);

  // Update daily BUZZ counter
  const updateDailyBuzzCounter = useCallback(async (): Promise<number> => {
    if (!userId) return 0;

    const newBuzzCounter = dailyBuzzCounter + 1;
    
    console.log('🔄 BUZZ COUNTER: Updating counter', { 
      oldCount: dailyBuzzCounter, 
      newCount: newBuzzCounter,
      nextPrice: calculateBuzzPrice(newBuzzCounter),
      nextCostM1U: calculateBuzzCostM1U(newBuzzCounter)
    });
    
    try {
      await supabase
        .from('user_buzz_counter')
        .upsert({
          user_id: userId,
          counter_date: new Date().toISOString().split('T')[0],
          daily_count: newBuzzCounter
        });
      
      setDailyBuzzCounter(newBuzzCounter);
      console.log('✅ BUZZ COUNTER: Updated successfully', { newBuzzCounter });
      
      return newBuzzCounter;
    } catch (err) {
      console.error('❌ BUZZ COUNTER: Update failed', err);
      return dailyBuzzCounter;
    }
  }, [userId, dailyBuzzCounter]);

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

  // Reload counter when userId changes or dailyBuzzCounter updates
  useEffect(() => {
    if (userId) {
      loadDailyBuzzCounter();
    }
  }, [userId, loadDailyBuzzCounter]);

  // Log current pricing for debugging
  useEffect(() => {
    console.log('📊 BUZZ COUNTER STATE UPDATE:', {
      dailyBuzzCounter,
      nextClickCostM1U: calculateBuzzCostM1U(dailyBuzzCounter),
      timestamp: new Date().toISOString()
    });
  }, [dailyBuzzCounter]);

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
