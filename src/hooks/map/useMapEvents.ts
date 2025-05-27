
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MapMarker } from '@/components/maps/types';

interface UseMapEventsProps {
  user: any;
  mapPoints: any[];
  setMapPoints: (points: any[]) => void;
  newPoint: MapMarker | null;
  setNewPoint: (point: MapMarker | null) => void;
  setActiveMapPoint: (id: string | null) => void;
  isAddingSearchArea: boolean;
  toggleAddingSearchArea: () => void;
}

export const useMapEvents = ({
  user,
  mapPoints,
  setMapPoints,
  newPoint,
  setNewPoint,
  setActiveMapPoint,
  isAddingSearchArea,
  toggleAddingSearchArea
}: UseMapEventsProps) => {

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
    
    // Reset search area adding mode if active
    if (isAddingSearchArea) {
      toggleAddingSearchArea();
    }
  }, [isAddingSearchArea, toggleAddingSearchArea, setNewPoint]);

  // Save the point to Supabase
  const savePoint = async (title: string, note: string) => {
    if (!newPoint || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('map_points')
        .insert([{
          user_id: user.id,
          latitude: newPoint.lat,
          longitude: newPoint.lng,
          title,
          note
        }])
        .select();

      if (error) {
        console.error("Error saving map point:", error);
        toast.error("Errore nel salvare il punto");
        return;
      }

      console.log("📍 Saved new point:", data);
      toast.success("Punto salvato con successo");
      
      // Add the new point to the current list
      if (data && data.length > 0) {
        setMapPoints(prev => [...prev, data[0]]);
      }
      
      // Reset new point state
      setNewPoint(null);
    } catch (err) {
      console.error("Exception saving map point:", err);
      toast.error("Errore nel salvare il punto");
    }
  };

  // Update an existing point
  const updateMapPoint = async (id: string, title: string, note: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('map_points')
        .update({
          title,
          note
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating map point:", error);
        toast.error("Errore nell'aggiornare il punto");
        return false;
      }

      // Update local state
      setMapPoints(prev => prev.map(point => 
        point.id === id ? { ...point, title, note } : point
      ));
      
      toast.success("Punto aggiornato con successo");
      setActiveMapPoint(null);
      return true;
    } catch (err) {
      console.error("Exception updating map point:", err);
      toast.error("Errore nell'aggiornare il punto");
      return false;
    }
  };

  // Delete a map point
  const deleteMapPoint = async (id: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('map_points')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error deleting map point:", error);
        toast.error("Errore nell'eliminare il punto");
        return false;
      }

      // Update local state
      setMapPoints(prev => prev.filter(point => point.id !== id));
      setActiveMapPoint(null);
      toast.success("Punto eliminato con successo");
      return true;
    } catch (err) {
      console.error("Exception deleting map point:", err);
      toast.error("Errore nell'eliminare il punto");
      return false;
    }
  };

  // Request user location
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      toast.info("Rilevamento posizione in corso...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Here you would update the map center
          toast.success("Posizione rilevata");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Errore nel rilevare la posizione");
        }
      );
    } else {
      toast.error("Geolocalizzazione non supportata dal browser");
    }
  };

  return {
    addNewPoint,
    savePoint,
    updateMapPoint,
    deleteMapPoint,
    requestLocationPermission
  };
};
