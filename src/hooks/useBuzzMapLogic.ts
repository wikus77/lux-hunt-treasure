
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

export interface MapArea {
  id: string;
  coordinates: { lat: number; lng: number };
  radius: number;
  color: string;
  colorName: string;
  week: number;
  generation: number;
}

export interface BuzzCounter {
  area_id: string;
  user_id: string;
  buzz_count: number;
  last_buzz_time: string | null;
}

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
}

export const useBuzzMapLogic = () => {
  const { user } = useAuthContext();
  const [areas, setAreas] = useState<BuzzMapArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMapAreas = async () => {
      setLoading(true);
      try {
        // Query the correct table name: user_map_areas instead of map_areas
        const { data, error } = await supabase
          .from('user_map_areas')
          .select('*')
          .order('week', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching map areas:", error);
          setError(error);
        } else {
          const buzzMapAreas: BuzzMapArea[] = data.map(area => ({
            id: area.id,
            lat: area.lat,
            lng: area.lng,
            radius_km: area.radius_km,
            coordinates: { lat: area.lat, lng: area.lng },
            radius: area.radius_km * 1000, // Convert km to meters for map display
            color: '#00FFFF', // Fixed cyan color
            colorName: 'cyan',
            week: area.week,
            generation: 1, // Default generation
            isActive: true // Default active state
          }));
          setAreas(buzzMapAreas);
        }
      } catch (err: any) {
        console.error("Unexpected error fetching map areas:", err);
        setError(new Error(err.message || "Failed to load map areas"));
      } finally {
        setLoading(false);
      }
    };

    fetchMapAreas();
  }, [user]);

  return {
    areas,
    loading,
    error,
    currentWeekAreas: areas,
    reloadAreas: () => {
      // Trigger a reload of areas
      setLoading(true);
      setError(null);
    }
  };
};
