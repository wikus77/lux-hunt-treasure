// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Map Progressive Pricing Hook - 42 Levels System

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

// Progressive Pricing Table - 42 Levels
const PROGRESSIVE_PRICING_TABLE = [
  { generation: 0, radius: 500, segment: "Entry", price: 4.99 },
  { generation: 1, radius: 450, segment: "Entry", price: 6.99 },
  { generation: 2, radius: 405, segment: "Entry", price: 8.99 },
  { generation: 3, radius: 365, segment: "Entry", price: 10.99 },
  { generation: 4, radius: 329, segment: "Entry", price: 12.99 },
  { generation: 5, radius: 295, segment: "Entry", price: 14.99 },
  { generation: 6, radius: 265, segment: "Entry", price: 16.99 },
  { generation: 7, radius: 240, segment: "Entry", price: 19.99 },
  { generation: 8, radius: 216, segment: "Entry", price: 21.99 },
  { generation: 9, radius: 195, segment: "Entry", price: 25.99 },
  { generation: 10, radius: 175, segment: "Entry", price: 29.99 },
  { generation: 11, radius: 155, segment: "Entry", price: 29.99 },
  { generation: 12, radius: 140, segment: "Entry", price: 29.99 },
  { generation: 13, radius: 126, segment: "Entry", price: 29.99 },
  { generation: 14, radius: 113, segment: "TRANSIZIONE", price: 29.99 },
  { generation: 15, radius: 102, segment: "Mid High-Spender", price: 29.99 },
  { generation: 16, radius: 92, segment: "Mid High-Spender", price: 44.99 },
  { generation: 17, radius: 83, segment: "Mid High-Spender", price: 67.99 },
  { generation: 18, radius: 75, segment: "Mid High-Spender", price: 101.99 },
  { generation: 19, radius: 67, segment: "Mid High-Spender", price: 152.99 },
  { generation: 20, radius: 60, segment: "Mid High-Spender", price: 229.99 },
  { generation: 21, radius: 54, segment: "Mid High-Spender", price: 344.99 },
  { generation: 22, radius: 49, segment: "Mid High-Spender", price: 517.99 },
  { generation: 23, radius: 44, segment: "High-Spender", price: 776.99 },
  { generation: 24, radius: 39, segment: "High-Spender", price: 1165.99 },
  { generation: 25, radius: 35, segment: "High-Spender", price: 1748.99 },
  { generation: 26, radius: 31, segment: "High-Spender", price: 2622.99 },
  { generation: 27, radius: 28, segment: "High-Spender", price: 2622.99 },
  { generation: 28, radius: 25, segment: "High-Spender", price: 2622.99 },
  { generation: 29, radius: 23, segment: "High-Spender", price: 2622.99 },
  { generation: 30, radius: 20, segment: "High-Spender", price: 2622.99 },
  { generation: 31, radius: 18, segment: "ELITE", price: 2622.99 },
  { generation: 32, radius: 16, segment: "ELITE", price: 2622.99 },
  { generation: 33, radius: 14.5, segment: "ELITE", price: 2622.99 },
  { generation: 34, radius: 13.1, segment: "ELITE", price: 2622.99 },
  { generation: 35, radius: 11.8, segment: "ELITE", price: 3933.99 },
  { generation: 36, radius: 10.6, segment: "ELITE", price: 3933.99 },
  { generation: 37, radius: 9.5, segment: "ELITE", price: 4999.00 },
  { generation: 38, radius: 8.6, segment: "ELITE", price: 4999.00 },
  { generation: 39, radius: 7.7, segment: "ELITE", price: 4999.00 },
  { generation: 40, radius: 6.9, segment: "ELITE", price: 4999.00 },
  { generation: 41, radius: 5, segment: "ELITE", price: 4999.00 }
];

interface BuzzMapCounter {
  user_id: string;
  date: string;
  buzz_map_count: number;
}

export const useBuzzMapProgressivePricing = () => {
  const [buzzMapPrice, setBuzzMapPrice] = useState(4.99);
  const [radiusKm, setRadiusKm] = useState(500);
  const [mapGenerationCount, setMapGenerationCount] = useState(0);
  const [segment, setSegment] = useState("Entry");
  const [dailyBuzzMapCounter, setDailyBuzzMapCounter] = useState(0);
  const [lastBuzzTime, setLastBuzzTime] = useState<Date | null>(null);
  const [isEligibleForBuzz, setIsEligibleForBuzz] = useState(true);
  const { user } = useAuthContext();
  
  // Load user's generation count and daily counter
  const loadUserData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Load map generation count from user_map_areas
      const { data: mapAreas, error: mapError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (mapError) {
        console.error('❌ Error loading map areas:', mapError);
        return;
      }

      const generationCount = mapAreas?.length || 0;
      setMapGenerationCount(generationCount);

      // Load daily buzz map counter
      const { data: dailyCounter, error: counterError } = await supabase
        .from('user_buzz_map_counter')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (!counterError && dailyCounter) {
        setDailyBuzzMapCounter(dailyCounter.buzz_map_count);
      } else {
        setDailyBuzzMapCounter(0);
      }

      // Get last buzz time for anti-spam protection
      const { data: lastAction, error: actionError } = await supabase
        .from('buzz_map_actions')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!actionError && lastAction) {
        const lastTime = new Date(lastAction.created_at);
        setLastBuzzTime(lastTime);
        
        // Check if 3 hours have passed since last buzz
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        setIsEligibleForBuzz(lastTime < threeHoursAgo);
      } else {
        setIsEligibleForBuzz(true);
      }

      // Calculate pricing based on generation count
      const pricingData = getPricingForGeneration(generationCount);
      setBuzzMapPrice(pricingData.price);
      setRadiusKm(pricingData.radius);
      setSegment(pricingData.segment);
      
      console.log('📊 BUZZ MAPPA Progressive Pricing Loaded:', {
        generation: generationCount,
        price: pricingData.price,
        radius: pricingData.radius,
        segment: pricingData.segment,
        dailyCounter: dailyCounter?.buzz_map_count || 0,
        isEligible: lastAction ? new Date(lastAction.created_at) < new Date(Date.now() - 3 * 60 * 60 * 1000) : true
      });
      
    } catch (err) {
      console.error('❌ Exception loading user BUZZ data:', err);
    }
  }, [user?.id]);

  // Get pricing data for specific generation
  const getPricingForGeneration = (generation: number) => {
    const maxGeneration = Math.min(generation, PROGRESSIVE_PRICING_TABLE.length - 1);
    return PROGRESSIVE_PRICING_TABLE[maxGeneration];
  };

  // Anti-fraud validation
  const validateBuzzRequest = useCallback(async (requestedPrice: number, requestedRadius: number): Promise<boolean> => {
    if (!user?.id) {
      console.warn('🚫 ANTI-FRAUD: No user ID');
      return false;
    }

    console.log('🔍 VALIDATE BUZZ REQUEST DEBUG:', {
      userId: user.id,
      requestedPrice,
      requestedRadius,
      mapGenerationCount,
      dailyBuzzMapCounter,
      isEligibleForBuzz,
      timestamp: new Date().toISOString()
    });

    // Check daily limit (max 3 BUZZ per day)
    if (dailyBuzzMapCounter >= 3) {
      console.warn('🚫 ANTI-FRAUD: Daily BUZZ limit exceeded', {
        dailyBuzzMapCounter,
        limit: 3
      });
      return false;
    }

    // Check time-based anti-spam (3 hours minimum)
    if (!isEligibleForBuzz) {
      console.warn('🚫 ANTI-FRAUD: Time-based anti-spam triggered', {
        isEligibleForBuzz,
        lastBuzzTime
      });
      return false;
    }

    // Validate price/radius correspondence
    const expectedPricing = getPricingForGeneration(mapGenerationCount);
    console.log('🔍 PRICING VALIDATION DEBUG:', {
      mapGenerationCount,
      expectedPricing,
      requested: { price: requestedPrice, radius: requestedRadius },
      priceDiff: Math.abs(requestedPrice - expectedPricing.price),
      radiusDiff: Math.abs(requestedRadius - expectedPricing.radius)
    });

    if (Math.abs(requestedPrice - expectedPricing.price) > 0.01 || 
        Math.abs(requestedRadius - expectedPricing.radius) > 1) {
      console.warn('🚫 ANTI-FRAUD: Price/radius mismatch detected', {
        requested: { price: requestedPrice, radius: requestedRadius },
        expected: expectedPricing,
        priceDiff: Math.abs(requestedPrice - expectedPricing.price),
        radiusDiff: Math.abs(requestedRadius - expectedPricing.radius)
      });
      return false;
    }

    // Check for suspicious large radius with low price
    if (requestedRadius >= 200 && requestedPrice < 13) {
      console.warn('🚫 ANTI-FRAUD: Suspicious large radius with low price', {
        requestedRadius,
        requestedPrice
      });
      return false;
    }

    console.log('✅ ANTI-FRAUD: Validation passed');
    return true;
  }, [user?.id, dailyBuzzMapCounter, isEligibleForBuzz, mapGenerationCount, lastBuzzTime]);

  // Check if user needs cost warning (high-cost alert)
  const needsCostWarning = useCallback((): boolean => {
    return radiusKm < 45 || buzzMapPrice > 500;
  }, [radiusKm, buzzMapPrice]);

  // Check if user is in ELITE segment with max price
  const isEliteMaxPrice = useCallback((): boolean => {
    return segment === "ELITE" && buzzMapPrice >= 4999;
  }, [segment, buzzMapPrice]);

  // Increment generation counter
  const incrementGeneration = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Validate the request
      const isValid = await validateBuzzRequest(buzzMapPrice, radiusKm);
      if (!isValid) {
        return false;
      }

      // Increment daily counter
      const { error: counterError } = await supabase
        .from('user_buzz_map_counter')
        .upsert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          buzz_map_count: dailyBuzzMapCounter + 1
        });

      if (counterError) {
        console.error('❌ Error updating daily counter:', counterError);
        return false;
      }

      // Log the action in buzz_map_actions
      const { error: actionError } = await supabase
        .from('buzz_map_actions')
        .insert({
          user_id: user.id,
          clue_count: 0, // Not used in progressive system
          cost_eur: buzzMapPrice,
          radius_generated: radiusKm
        });

      if (actionError) {
        console.error('❌ Error logging BUZZ action:', actionError);
        return false;
      }

      // Update local state
      const newGenerationCount = mapGenerationCount + 1;
      setMapGenerationCount(newGenerationCount);
      setDailyBuzzMapCounter(dailyBuzzMapCounter + 1);
      setLastBuzzTime(new Date());
      setIsEligibleForBuzz(false);

      // Update pricing for next generation
      const nextPricing = getPricingForGeneration(newGenerationCount);
      setBuzzMapPrice(nextPricing.price);
      setRadiusKm(nextPricing.radius);
      setSegment(nextPricing.segment);

      console.log('✅ BUZZ MAPPA Generation incremented:', {
        newGeneration: newGenerationCount,
        nextPrice: nextPricing.price,
        nextRadius: nextPricing.radius,
        nextSegment: nextPricing.segment
      });

      return true;
    } catch (error) {
      console.error('❌ Error incrementing generation:', error);
      return false;
    }
  }, [user?.id, buzzMapPrice, radiusKm, mapGenerationCount, dailyBuzzMapCounter, validateBuzzRequest]);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id, loadUserData]);

  // Listen for mission reset events to reload data
  useEffect(() => {
    const handleMissionReset = () => {
      console.log('🔄 BUZZ MAPPA: Mission reset detected, reloading data...');
      if (user?.id) {
        loadUserData();
      }
    };

    // Listen for custom reset event
    window.addEventListener('missionReset', handleMissionReset);

    // Also listen for storage changes (localStorage clear indicates reset)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === null) { // localStorage.clear() was called
        console.log('🔄 BUZZ MAPPA: Storage cleared, reloading data...');
        if (user?.id) {
          loadUserData();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('missionReset', handleMissionReset);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id, loadUserData]);

  // Subscribe to real-time changes in relevant tables
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('buzz_map_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_buzz_map_counter',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('🔄 BUZZ MAPPA: Database change detected, reloading...');
          loadUserData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buzz_map_actions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('🔄 BUZZ MAPPA: BUZZ action change detected, reloading...');
          loadUserData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_map_areas',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('🔄 BUZZ MAPPA: Map areas change detected, reloading...');
          loadUserData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, loadUserData]);

  return {
    buzzMapPrice,
    radiusKm,
    mapGenerationCount,
    segment,
    dailyBuzzMapCounter,
    isEligibleForBuzz,
    lastBuzzTime,
    needsCostWarning,
    isEliteMaxPrice,
    validateBuzzRequest,
    incrementGeneration,
    loadUserData,
    // Pricing table for reference
    PROGRESSIVE_PRICING_TABLE
  };
};