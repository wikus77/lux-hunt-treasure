// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { calculateNextBuzzMapPrice, calculateNextBuzzMapRadius } from '@/lib/buzzMapPricing';

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
      // Count existing BUZZ MAP areas for this user
      const { count, error } = await supabase
        .from('user_map_areas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('source', 'buzz_map');

      if (error) {
        console.error('Error loading BUZZ MAP generation:', error);
        return;
      }

      const currentGeneration = count || 0;
      setGeneration(currentGeneration);
      
      // Calculate price and radius for NEXT generation
      const nextPrice = calculateNextBuzzMapPrice(currentGeneration);
      const nextRadius = calculateNextBuzzMapRadius(currentGeneration);
      
      setPrice(nextPrice);
      setRadius(nextRadius);

      console.log('🎯 BUZZ MAP Pricing loaded:', { 
        currentGeneration, 
        nextPrice, 
        nextRadius 
      });

    } catch (error) {
      console.error('Exception loading BUZZ MAP generation:', error);
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