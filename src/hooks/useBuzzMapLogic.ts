
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

export interface BuzzMapArea {
  id: string;
  lat: number;
  lng: number;
  radius_km: number;
  coordinates: { lat: number; lng: number };
  radius: number;
  color: string;
  colorName: string;
  week: number;
  generation: number;
  isActive: boolean;
  user_id: string;
  created_at: string;
}

export const useBuzzMapLogic = () => {
  const { user } = useAuthContext();
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCurrentWeekAreas = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // CORRETTO: usa 'user_map_areas' invece di 'map_areas'
      const { data, error: fetchError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching current week areas:', fetchError);
        setError(fetchError);
        return;
      }

      // Transform to BuzzMapArea format con TUTTE le proprietà richieste
      const transformedAreas: BuzzMapArea[] = (data || []).map(area => ({
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

      setCurrentWeekAreas(transformedAreas);
    } catch (err) {
      console.error('Exception fetching areas:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const reloadAreas = () => {
    fetchCurrentWeekAreas();
  };

  useEffect(() => {
    // Evita cicli infiniti con debounce
    const timeoutId = setTimeout(() => {
      fetchCurrentWeekAreas();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [user?.id]);

  return {
    areas: currentWeekAreas,
    loading,
    error: error || new Error('No error'),
    currentWeekAreas,
    reloadAreas
  };
};
