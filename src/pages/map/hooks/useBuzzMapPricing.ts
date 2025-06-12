
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export const useBuzzMapPricing = () => {
  const [buzzMapPrice, setBuzzMapPrice] = useState(7.99);
  const [clueCount, setClueCount] = useState(0);
  const [radiusKm, setRadiusKm] = useState(500); // Start from 500km
  const [mapGenerationCount, setMapGenerationCount] = useState(0);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        // Get user clues count
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
        
        // Calculate price based on clue count
        let price = 7.99;
        if (totalClues > 40) price = 29.99;
        else if (totalClues > 30) price = 19.99;
        else if (totalClues > 20) price = 13.99;
        else if (totalClues > 10) price = 9.99;
        
        setBuzzMapPrice(price);

        // Get map generation count for this user
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

        // Calculate radius with progressive reduction: 500km -> 5km
        // Formula: radius = max(5, 500 * (0.7^generation_count))
        let calculatedRadius = Math.max(5, 500 * Math.pow(0.7, generationCount));
        setRadiusKm(Math.round(calculatedRadius));
        
        console.log(`🗺️ Map pricing calculated: price=€${price}, radius=${calculatedRadius}km, generation=${generationCount}`);
        
      } catch (err) {
        console.error('Exception fetching user data:', err);
      }
    };

    fetchUserData();
    
    // Setup interval to refresh data every 60 seconds
    const intervalId = setInterval(fetchUserData, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const incrementGeneration = () => {
    const newCount = mapGenerationCount + 1;
    setMapGenerationCount(newCount);
    
    // Update radius for next generation
    let newRadius = Math.max(5, 500 * Math.pow(0.7, newCount));
    setRadiusKm(Math.round(newRadius));
    
    return Math.round(500 * Math.pow(0.7, mapGenerationCount)); // Return current radius for this generation
  };

  return { 
    buzzMapPrice, 
    clueCount, 
    radiusKm,
    mapGenerationCount,
    incrementGeneration
  };
};
