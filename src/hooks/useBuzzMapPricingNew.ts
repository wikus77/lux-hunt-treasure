// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
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
      // Use fetch instead of supabase client to avoid type issues
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_map_areas?user_id=eq.${user.id}&source=eq.buzz_map&select=id`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${(await import('@/integrations/supabase/client').then(m => m.supabase.auth.getSession())).data.session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch areas');
      }

      const areas = await response.json();
      const currentGeneration = Array.isArray(areas) ? areas.length : 0;
      
      setGeneration(currentGeneration);
      
      // Calculate price and radius for NEXT level (currentGeneration + 1)
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
      // Set defaults on error
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