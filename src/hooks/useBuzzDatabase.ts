
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BuzzMapArea } from './useBuzzMapLogic';

export const useBuzzDatabase = () => {
  // Generate new BUZZ MAPPA area in database
  const createBuzzMapArea = useCallback(async (
    userId: string,
    centerLat: number,
    centerLng: number,
    radiusKm: number,
    currentWeek: number
  ): Promise<BuzzMapArea | null> => {
    try {
      const newArea = {
        user_id: userId,
        lat: centerLat,
        lng: centerLng,
        radius_km: radiusKm,
        week: currentWeek
      };

      console.log('💾 CRITICAL RADIUS - Inserting new area into database:', newArea);
      const { data, error } = await supabase
        .from('user_map_areas')
        .insert(newArea)
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving map area:', error);
        toast.error('Errore nel salvare l\'area sulla mappa');
        return null;
      }

      console.log('✅ CRITICAL RADIUS - NEW BUZZ MAPPA area saved in DB:', data);
      console.log('📏 NEW RADIUS SAVED:', {
        radius_km: data.radius_km,
        radius_meters: data.radius_km * 1000,
        area_id: data.id,
        previous_radius_should_be_different: true
      });
      
      return data;
    } catch (err) {
      console.error('❌ Exception creating map area:', err);
      toast.error('Errore durante la creazione dell\'area');
      return null;
    }
  }, []);

  return {
    createBuzzMapArea
  };
};
