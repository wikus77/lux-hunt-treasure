
import { useState, useEffect } from 'react';
import { BuzzMapArea } from './useBuzzMapLogic';
import { supabase } from '@/integrations/supabase/client';

export const useMapAreas = () => {
  const [areas, setAreas] = useState<BuzzMapArea[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*');

      if (error) {
        console.error('Error fetching areas:', error);
        return;
      }

      // Transform to BuzzMapArea format
      const buzzAreas: BuzzMapArea[] = data.map(area => ({
        id: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km: area.radius_km,
        coordinates: { lat: area.lat, lng: area.lng },
        radius: area.radius_km * 1000,
        color: '#00FFFF',
        colorName: 'cyan',
        week: area.week,
        generation: 1,
        isActive: true,
        user_id: area.user_id,
        created_at: area.created_at || new Date().toISOString()
      }));

      setAreas(buzzAreas);
    } catch (err) {
      console.error('Exception fetching areas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  return {
    areas,
    loading,
    fetchAreas
  };
};
