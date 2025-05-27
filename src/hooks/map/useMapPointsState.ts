
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MapMarker } from '@/components/maps/types';

export const useMapPointsState = (userId?: string) => {
  const [mapPoints, setMapPoints] = useState<any[]>([]);
  const [newPoint, setNewPoint] = useState<MapMarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMapPoint, setActiveMapPoint] = useState<string | null>(null);

  // Fetch existing map points on mount
  useEffect(() => {
    const fetchMapPoints = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('map_points')
          .select('*')
          .eq('user_id', userId);

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
  }, [userId]);

  // Add a new point to the map
  const addNewPoint = useCallback((lat: number, lng: number) => {
    console.log("📍 Adding new point at:", lat, lng);
    setNewPoint({
      id: 'new',
      lat,
      lng,
      title: '',
      note: '',
      position: { lat, lng }
    });
  }, []);

  return {
    mapPoints,
    setMapPoints,
    newPoint,
    setNewPoint,
    isLoading,
    activeMapPoint,
    setActiveMapPoint,
    addNewPoint
  };
};
