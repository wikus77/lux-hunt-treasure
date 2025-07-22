
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBuzzPricing = (userId: string | undefined) => {
  const [userCluesCount, setUserCluesCount] = useState(0);

  // Load user clues count for pricing calculation
  const loadUserCluesCount = useCallback(async () => {
    if (!userId) return;

    try {
      const { count, error } = await supabase
        .from('user_clues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading user clues count:', error);
        return;
      }

      const cluesCount = count || 0;
      setUserCluesCount(cluesCount);
      console.log('📊 User clues count loaded:', cluesCount);
    } catch (err) {
      console.error('Exception loading user clues count:', err);
    }
  }, [userId]);

  // Calculate BUZZ MAP price based on clues count
  const calculateBuzzMapPrice = useCallback((): number => {
    console.log('💰 Calculating price for clues count:', userCluesCount);
    
    if (userCluesCount <= 10) {
      console.log('💰 Price tier: 1-10 clues = 7.99€');
      return 7.99;
    }
    if (userCluesCount <= 20) {
      console.log('💰 Price tier: 11-20 clues = 9.99€');
      return 9.99;
    }
    if (userCluesCount <= 30) {
      console.log('💰 Price tier: 21-30 clues = 13.99€');
      return 13.99;
    }
    if (userCluesCount <= 40) {
      console.log('💰 Price tier: 31-40 clues = 19.99€');
      return 19.99;
    }
    console.log('💰 Price tier: 41+ clues = 29.99€');
    return 29.99;
  }, [userCluesCount]);

  // Test pricing logic
  const testCalculationLogic = useCallback(() => {
    console.log('🧪 TESTING BUZZ MAPPA PRICING:');
    console.log('Current user clues:', userCluesCount);
    console.log('Calculated price:', calculateBuzzMapPrice());
    
    const testCases = [5, 15, 25, 35, 45];
    testCases.forEach(clues => {
      const oldCount = userCluesCount;
      setUserCluesCount(clues);
      console.log(`With ${clues} clues: ${calculateBuzzMapPrice()}€`);
      setUserCluesCount(oldCount);
    });
  }, [userCluesCount, calculateBuzzMapPrice]);

  useEffect(() => {
    if (userId) {
      loadUserCluesCount();
    }
  }, [userId, loadUserCluesCount]);

  return {
    userCluesCount,
    calculateBuzzMapPrice,
    testCalculationLogic,
    loadUserCluesCount
  };
};
