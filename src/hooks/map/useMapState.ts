
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { MapMarker } from '@/components/maps/types';

export const useMapState = () => {
  const { user } = useAuth();
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [mapPoints, setMapPoints] = useState<any[]>([]);
  const [newPoint, setNewPoint] = useState<MapMarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMapPoint, setActiveMapPoint] = useState<string | null>(null);

  // Default location (Rome, Italy)
  const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

  // Fetch existing map points on mount
  useEffect(() => {
    const fetchMapPoints = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('map_points')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error fetching map points:", error);
          toast.error("Errore nel caricamento dei punti");
          return;
        }

        console.log("📍 Fetched map points:", data);
        setMapPoints(data || []);
      } catch (err) {
        console.error("Exception fetching map points:", err);
        toast.error("Errore nel caricamento dei punti");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapPoints();
  }, [user]);

  return {
    isAddingPoint,
    setIsAddingPoint,
    mapPoints,
    setMapPoints,
    newPoint,
    setNewPoint,
    isLoading,
    activeMapPoint,
    setActiveMapPoint,
    DEFAULT_LOCATION,
    user
  };
};
