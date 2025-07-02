
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

export const useBuzzMapPricing = () => {
  const [buzzMapPrice, setBuzzMapPrice] = useState(7.99);
  const [clueCount, setClueCount] = useState(0);
  const [radiusKm, setRadiusKm] = useState(500);
  const [mapGenerationCount, setMapGenerationCount] = useState(0);
  const { user } = useAuthContext();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        const { count: clueCount, error: clueError } = await supabase
          .from('user_clues')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (clueError) {
          console.error('Error fetching user clues count:', clueError);
          return;
        }
        
        const totalClues = clueCount || 0;
        setClueCount(totalClues);
        
        let price = 7.99;
        if (totalClues > 40) price = 29.99;
        else if (totalClues > 30) price = 19.99;
        else if (totalClues > 20) price = 13.99;
        else if (totalClues > 10) price = 9.99;
        
        setBuzzMapPrice(price);

        const { data: mapAreas, error: mapError } = await supabase
          .from('user_map_areas')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (mapError) {
          console.error('Error fetching map areas:', mapError);
          return;
        }

        const generationCount = mapAreas?.length || 0;
        setMapGenerationCount(generationCount);

        let calculatedRadius = Math.max(5, 500 * Math.pow(0.7, generationCount));
        setRadiusKm(Math.round(calculatedRadius));
        
        console.log(`🗺️ BUZZ MAPPA: Pricing calculated - price=€${price}, radius=${calculatedRadius.toFixed(2)}km, generation=${generationCount}`);
        
      } catch (err) {
        console.error('Exception fetching user data:', err);
      }
    };

    fetchUserData();
    
    const intervalId = setInterval(fetchUserData, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const incrementGeneration = () => {
    const newCount = mapGenerationCount + 1;
    setMapGenerationCount(newCount);
    
    const currentRadius = Math.max(5, 500 * Math.pow(0.7, mapGenerationCount));
    const nextRadius = Math.max(5, 500 * Math.pow(0.7, newCount));
    setRadiusKm(Math.round(nextRadius));
    
    console.log(`🗺️ BUZZ MAPPA: Generation incremented to ${newCount}, current radius: ${currentRadius.toFixed(2)}km, next radius: ${nextRadius.toFixed(2)}km`);
    
    return Math.round(currentRadius);
  };

  return { 
    buzzMapPrice, 
    clueCount, 
    radiusKm,
    mapGenerationCount,
    incrementGeneration
  };
};
