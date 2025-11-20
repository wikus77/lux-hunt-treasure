// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Map Progressive Pricing Hook - 42 Levels System

import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // © 2025 Joseph MULÉ – M1SSION™ – BUZZ Override System DB-Driven
  const [buzzOverride, setBuzzOverride] = useState({ cooldown_disabled: false, free_remaining: 0, expires_at: null });
  const overrideLoadedRef = useRef(false);
  
  // © 2025 Joseph MULÉ – M1SSION™ – Load BUZZ Override - Hardcoded for wikus77@hotmail.it
  const loadBuzzOverride = useCallback(async () => {
    if (!user?.id || overrideLoadedRef.current) return;
    
    try {
      console.log('[FREE-OVERRIDE] Loading override for user:', user.id);
      
      // Get current user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.warn('[FREE-OVERRIDE] User auth error:', userError);
        setBuzzOverride({ cooldown_disabled: false, free_remaining: 0, expires_at: null });
        overrideLoadedRef.current = true;
        return;
      }
      
      // Hardcode override for wikus77@hotmail.it
      if (userData.user?.email === 'wikus77@hotmail.it') {
        const storedRemaining = localStorage.getItem('freeBuzzRemaining');
        const freeRemaining = storedRemaining ? parseInt(storedRemaining) : 10;
        
        setBuzzOverride({
          cooldown_disabled: true,
          free_remaining: freeRemaining,
          expires_at: '2025-10-08T23:59:59Z'
        });
        
        console.info('[FREE-OVERRIDE] Local override active for wikus77@hotmail.it:', {
          cooldown_disabled: true,
          free_remaining: freeRemaining,
          expires_at: '2025-10-08T23:59:59Z'
        });
      } else {
        // No override for other users
        setBuzzOverride({ cooldown_disabled: false, free_remaining: 0, expires_at: null });
      }
      
      overrideLoadedRef.current = true;
    } catch (err) {
      // Silent fallback: if error, no override (no regression)
      console.warn('[FREE-OVERRIDE] Exception loading override, using defaults:', err);
      setBuzzOverride({ cooldown_disabled: false, free_remaining: 0, expires_at: null });
      overrideLoadedRef.current = true;
    }
  }, [user?.id]);

  // Load user's generation count and daily counter
  const loadUserData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 BUZZ MAPPA: Loading user data...');
      
      // Load override first
      await loadBuzzOverride();
      
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
      
      console.log('📊 BUZZ MAPPA: Map areas loaded:', {
        totalAreas: generationCount,
        areas: mapAreas
      });
      
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

      // Get last buzz time for anti-spam protection - DEBUG MODE
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
        
        // © 2025 Joseph MULÉ – M1SSION™ – Override Layer: Disable cooldown via DB override
        let isEligible;
        if (buzzOverride.cooldown_disabled === true) {
          // Skip cooldown check for users with override
          isEligible = true;
          console.info('[FREE-OVERRIDE] Cooldown bypassed via DB override');
        } else {
          // Normal cooldown logic: 3 hours
          const cooldownTime = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours
          isEligible = lastTime < cooldownTime;
        }
        setIsEligibleForBuzz(isEligible);
        
        console.log('🕒 BUZZ MAPPA COOLDOWN CHECK:', {
          lastBuzzTime: lastTime.toISOString(),
          cooldownDisabled: buzzOverride.cooldown_disabled,
          secondsSinceLastBuzz: (Date.now() - lastTime.getTime()) / 1000,
          isEligible,
          debugMode: true,
          overrideActive: buzzOverride.cooldown_disabled || buzzOverride.free_remaining > 0
        });
      } else {
        setIsEligibleForBuzz(true);
        console.log('✅ BUZZ MAPPA: No previous BUZZ found, eligible immediately');
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
        isEligible: lastAction ? new Date(lastAction.created_at) < new Date(Date.now() - 3 * 60 * 60 * 1000) : true,
        resetDetected: generationCount === 0 && (mapAreas?.length === 0)
      });
      
      // 🚨 POST-RESET SYNC: If generation count is 0 after reset, force sync
      if (generationCount === 0) {
        console.log('🔄 BUZZ MAPPA: Reset state detected, forcing price sync...');
        const entryPricing = getPricingForGeneration(0);
        setBuzzMapPrice(entryPricing.price);
        setRadiusKm(entryPricing.radius);
        setSegment(entryPricing.segment);
      }
      
    } catch (err) {
      console.error('❌ Exception loading user BUZZ data:', err);
    }
  }, [user?.id, loadBuzzOverride]);

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

    // © 2025 Joseph MULÉ – M1SSION™ – Override Layer: Skip anti-spam if cooldown disabled
    if (!isEligibleForBuzz && !buzzOverride.cooldown_disabled) {
      console.warn('🚫 ANTI-FRAUD: Time-based anti-spam triggered', {
        isEligibleForBuzz,
        lastBuzzTime,
        cooldownHours: 3,
        overrideCooldownDisabled: buzzOverride.cooldown_disabled
      });
      return false;
    }

    // 🚨 POST-RESET SYNC: Force reload if mapGenerationCount seems out of sync
    let currentGeneration = mapGenerationCount;
    if (mapGenerationCount === 0 && (requestedPrice === 4.99 && requestedRadius === 500)) {
      console.log('🔄 POST-RESET DETECTED: Accepting entry-level pricing even if sync pending');
      currentGeneration = 0; // Force entry level validation
    } else {
      // For non-entry requests, verify real-time generation count
      try {
        const { data: realTimeAreas } = await supabase
          .from('user_map_areas')
          .select('id')
          .eq('user_id', user.id);
        
        currentGeneration = realTimeAreas?.length || 0;
        
        if (currentGeneration !== mapGenerationCount) {
          console.log('🔄 SYNC CORRECTION: Real-time count differs from cached', {
            cached: mapGenerationCount,
            realTime: currentGeneration
          });
        }
      } catch (error) {
        console.warn('⚠️ Failed to get real-time generation count, using cached:', error);
      }
    }

    // Validate price/radius correspondence with corrected generation
    const expectedPricing = getPricingForGeneration(currentGeneration);
    console.log('🔍 PRICING VALIDATION DEBUG:', {
      currentGeneration,
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
        radiusDiff: Math.abs(requestedRadius - expectedPricing.radius),
        currentGeneration,
        mapGenerationCount
      });
      return false;
    }

    // Check for suspicious large radius with low price (EXCEPTION: Entry-level post-reset)
    if (requestedRadius >= 200 && requestedPrice < 13) {
      // 🚨 POST-RESET EXCEPTION: Allow first 2 entry-level BUZZ post-reset
      const isEntryLevel1 = (currentGeneration === 0 && requestedPrice === 4.99 && requestedRadius === 500);
      const isEntryLevel2 = (currentGeneration === 1 && requestedPrice === 6.99 && requestedRadius === 450);
      
      if (isEntryLevel1 || isEntryLevel2) {
        console.log('✅ ANTI-FRAUD: POST-RESET ENTRY-LEVEL ACCEPTED', {
          currentGeneration,
          requestedPrice,
          requestedRadius,
          level: isEntryLevel1 ? 'Level 1' : 'Level 2',
          reason: 'Entry-level BUZZ allowed after mission reset (first 2 levels)'
        });
      } else {
        console.warn('🚫 ANTI-FRAUD: Suspicious large radius with low price', {
          requestedRadius,
          requestedPrice,
          currentGeneration,
          note: 'Blocked suspicious combination (not entry-level post-reset)'
        });
        return false;
      }
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

  // © 2025 Joseph MULÉ – M1SSION™ – Consume Free BUZZ locally for wikus77@hotmail.it
  const consumeFreeBuzz = useCallback(async (): Promise<boolean> => {
    if (buzzOverride.free_remaining <= 0) return false;
    
    try {
      console.log('[FREE-OVERRIDE] Attempting to consume free BUZZ, remaining:', buzzOverride.free_remaining);
      
      // Get current user for email check
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.email === 'wikus77@hotmail.it') {
        // Consume locally for wikus77@hotmail.it
        const newRemaining = Math.max(0, buzzOverride.free_remaining - 1);
        localStorage.setItem('freeBuzzRemaining', String(newRemaining));
        
        setBuzzOverride(prev => ({ 
          ...prev, 
          free_remaining: newRemaining 
        }));
        
        console.info('[FREE-OVERRIDE] Free BUZZ consumed locally:', {
          ok: true,
          remaining: newRemaining,
          message: 'Local consumption for wikus77@hotmail.it'
        });
        return true;
      }
      
      console.warn('[FREE-OVERRIDE] Free BUZZ only available for wikus77@hotmail.it');
      return false;
    } catch (err) {
      console.warn('[FREE-OVERRIDE] Exception consuming free BUZZ, falling back to normal pricing:', err);
      return false;
    }
  }, [buzzOverride.free_remaining]);

  // Increment generation counter
  const incrementGeneration = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // © 2025 Joseph MULÉ – M1SSION™ – Try to consume free BUZZ first
      const usedFreeBuzz = await consumeFreeBuzz();
      
      if (!usedFreeBuzz) {
        // Validate the request only if not using free BUZZ
        const isValid = await validateBuzzRequest(buzzMapPrice, radiusKm);
        if (!isValid) {
          console.warn('🚫 BUZZ MAP: Validation failed, not blocking button');
          return false;
        }
      } else {
        console.log('🆓 Free BUZZ used, skipping validation and payment');
      }

      // Increment daily counter
      // Fix duplicate key constraint by using INSERT ON CONFLICT approach
      const todayDate = new Date().toISOString().split('T')[0];
      
      // First try to insert, if conflict then update
      const { error: counterError } = await supabase
        .from('user_buzz_map_counter')
        .insert({
          user_id: user.id,
          date: todayDate,
          buzz_map_count: 1
        });

      if (counterError && counterError.code === '23505') {
        // Record exists, update it
        const { error: updateError } = await supabase
          .from('user_buzz_map_counter')
          .update({
            buzz_map_count: dailyBuzzMapCounter + 1
          })
          .eq('user_id', user.id)
          .eq('date', todayDate);
          
        if (updateError) {
          console.error('❌ Error updating existing daily counter:', updateError);
          return false;
        }
        console.log('✅ Successfully updated existing daily counter');
      } else if (counterError) {
        console.error('❌ Error creating daily counter:', counterError);
        return false;
      } else {
        console.log('✅ Successfully created new daily counter');
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
  }, [user?.id, buzzMapPrice, radiusKm, mapGenerationCount, dailyBuzzMapCounter, validateBuzzRequest, consumeFreeBuzz]);

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
    // © 2025 Joseph MULÉ – M1SSION™ – Override System
    buzzOverride,
    setBuzzOverride,
    consumeFreeBuzz,
    // Pricing table for reference
    PROGRESSIVE_PRICING_TABLE
  };
};