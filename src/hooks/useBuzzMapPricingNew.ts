// © 2025 M1SSION™ – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BUZZ_MAP_LEVELS, type BuzzMapLevel } from '@/lib/buzzMapPricing';

export function useBuzzMapPricingNew(userId?: string) {
  const [loading, setLoading] = useState(true);
  const [nextLevel, setNextLevel] = useState(1);
  const [nextRadiusKm, setNextRadiusKm] = useState(500);
  const [nextPriceEur, setNextPriceEur] = useState(4.99);

  useEffect(() => {
    let killed = false;
    
    const loadPricing = async () => {
      setLoading(true);
      
      try {
        if (!userId) {
          // Default to level 1 when no user
          const defaultLevel = BUZZ_MAP_LEVELS[0];
          if (!killed) {
            setNextLevel(1);
            setNextRadiusKm(Math.max(0.5, defaultLevel.radiusKm));
            setNextPriceEur(defaultLevel.priceEur);
          }
        } else {
          // Count existing buzz map areas using exact count
          const { count, error } = await supabase
            .from('user_map_areas')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('source', 'buzz_map');

          if (error) {
            throw error;
          }

          // Calculate next level (1-60)
          const nextLvl = Math.min((count ?? 0) + 1, 60);
          const levelData: BuzzMapLevel = BUZZ_MAP_LEVELS[nextLvl - 1];
          
          if (!killed) {
            setNextLevel(nextLvl);
            setNextRadiusKm(Math.max(0.5, levelData.radiusKm));
            setNextPriceEur(levelData.priceEur);
          }

          console.log('🎯 BUZZ MAP Pricing loaded:', { 
            existingAreas: count ?? 0,
            nextLevel: nextLvl,
            nextRadiusKm: Math.max(0.5, levelData.radiusKm),
            nextPriceEur: levelData.priceEur
          });
        }
      } catch (error) {
        console.error('Exception loading BUZZ MAP pricing:', error);
        // Set defaults on error (Level 1)
        if (!killed) {
          setNextLevel(1);
          setNextRadiusKm(500);
          setNextPriceEur(4.99);
        }
      } finally {
        if (!killed) {
          setLoading(false);
        }
      }
    };

    loadPricing();
    
    return () => { 
      killed = true; 
    };
  }, [userId]);

  return { 
    loading, 
    nextLevel, 
    nextRadiusKm, 
    nextPriceEur,
    // Backward compatibility
    generation: nextLevel - 1,
    price: nextPriceEur,
    radius: nextRadiusKm
  };
}