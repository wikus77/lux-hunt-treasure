
import { useState, useEffect } from 'react';
import { BuzzMapArea } from './useBuzzMapLogic';
import { supabase } from '@/integrations/supabase/client';

export const useBuzzAreaManagement = () => {
  const [areas, setAreas] = useState<BuzzMapArea[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAreas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading areas:', error);
        return;
      }

      // Transform Supabase data to BuzzMapArea format
      const transformedAreas: BuzzMapArea[] = data.map(area => ({
        id: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km: area.radius_km,
        coordinates: { lat: area.lat, lng: area.lng },
        radius: area.radius_km * 1000, // Convert to meters
        color: '#00FFFF',
        colorName: 'cyan',
        week: area.week,
        generation: 1,
        isActive: true,
        user_id: area.user_id,
        created_at: area.created_at || new Date().toISOString()
      }));

      setAreas(transformedAreas);
    } catch (err) {
      console.error('Exception loading areas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  return {
    areas,
    loading,
    loadAreas
  };
};
