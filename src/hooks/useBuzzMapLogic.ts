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
        const { data, error } = await supabase
          .from('map_areas')
          .select('*')
          .order('week', { ascending: false })
          .order('generation', { ascending: false });

        if (error) {
          console.error("Error fetching map areas:", error);
          setError(error);
        } else {
          const buzzMapAreas: BuzzMapArea[] = data.map(area => ({
            id: area.id,
            coordinates: { lat: area.latitude, lng: area.longitude },
            radius: area.radius,
            color: area.color,
            colorName: area.color_name,
            week: area.week,
            generation: area.generation,
            isActive: area.is_active
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
    error
  };
};
