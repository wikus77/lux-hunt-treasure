// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { calculateNextBuzzMapPrice, calculateNextBuzzMapRadius } from '@/lib/buzzMapPricing';
import { supabase } from '@/integrations/supabase/client';

export const useBuzzMapPricingNew = () => {
  const { user } = useAuthContext();
  const [generation, setGeneration] = useState(0);
  const [price, setPrice] = useState(4.99);
  const [radius, setRadius] = useState(500);
  const [loading, setLoading] = useState(true);

  const loadGeneration = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Use authenticated Supabase client directly - NO MORE import.meta.env.VITE_* dependencies
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Count existing buzz map areas for this user using simpler approach
      const { data: areas, error } = await (supabase as any)
        .from('user_map_areas')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('source', 'buzz_map');

      if (error) {
        throw error;
      }

      const currentGeneration = Array.isArray(areas) ? areas.length : 0;
      setGeneration(currentGeneration);
      
      // Calculate price and radius for NEXT level (currentGeneration + 1)
      const nextPriceData = calculateNextBuzzMapPrice(currentGeneration);
      const nextRadius = calculateNextBuzzMapRadius(currentGeneration);
      
      setPrice(nextPriceData.priceEur);
      setRadius(nextRadius);

      console.log('🎯 BUZZ MAP Pricing loaded:', { 
        currentGeneration, 
        nextLevel: nextPriceData.level,
        nextPrice: nextPriceData.priceEur,
        nextRadius 
      });

    } catch (error) {
      console.error('Exception loading BUZZ MAP generation:', error);
      // Set defaults on error (Level 1)
      setGeneration(0);
      setPrice(4.99);
      setRadius(500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadGeneration();
    }
  }, [user]);

  return {
    generation,
    price,
    radius,
    loading,
    reloadGeneration: loadGeneration
  };
};