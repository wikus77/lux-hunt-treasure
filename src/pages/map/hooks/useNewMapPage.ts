
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSearchAreasLogic } from './useSearchAreasLogic';

interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  note: string;
}

interface NewPoint {
  latitude: number | null;
  longitude: number | null;
}

export const useNewMapPage = () => {
  const [mapPoints, setMapPoints] = useLocalStorage<MapPoint[]>('map-points', []);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [newPoint, setNewPoint] = useState<NewPoint>({ latitude: null, longitude: null });
  const [activeMapPoint, setActiveMapPoint] = useState<string | null>(null);

  const defaultLocation: [number, number] = [41.9028, 12.4964]; // Rome, Italy

  // Use search areas logic
  const searchAreasLogic = useSearchAreasLogic(defaultLocation);

  // Generate search area function
  const generateSearchArea = useCallback(() => {
    try {
      console.log("Generating search area from BUZZ MAPPA button...");
      
      // Calculate radius based on existing areas this week
      const calculatedRadius = searchAreasLogic.calculateRadius ? searchAreasLogic.calculateRadius() : 100000; // 100km default
      
      // Set the pending radius
      searchAreasLogic.setPendingRadius(calculatedRadius);
      
      // Activate adding mode
      searchAreasLogic.setIsAddingSearchArea(true);
      
      // Generate a random area ID for tracking
      const areaId = Date.now().toString();
      
      console.log(`Search area generation initiated with radius: ${calculatedRadius/1000}km`);
      toast.info("Clicca sulla mappa per posizionare l'area di ricerca BUZZ", {
        description: `Raggio: ${(calculatedRadius/1000).toFixed(1)}km`
      });
      
      return areaId;
    } catch (error) {
      console.error("Error generating search area:", error);
      toast.error("Errore nella generazione dell'area di ricerca");
      return null;
    }
  }, [searchAreasLogic]);

  // Load map points from Supabase
  useEffect(() => {
    const loadMapPoints = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: points, error } = await supabase
          .from('map_points')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading map points:', error);
          return;
        }

        if (points) {
          setMapPoints(points);
        }
      } catch (error) {
        console.error('Error in loadMapPoints:', error);
      }
    };

    loadMapPoints();
  }, [setMapPoints]);

  const addNewPoint = useCallback((lat: number, lng: number) => {
    setNewPoint({ latitude: lat, longitude: lng });
    setIsAddingPoint(true);
  }, []);

  const savePoint = useCallback(async (title: string, note: string) => {
    if (!newPoint.latitude || !newPoint.longitude || !title.trim()) {
      toast.error('Titolo richiesto per salvare il punto');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Devi essere autenticato per salvare punti');
        return;
      }

      const { data, error } = await supabase
        .from('map_points')
        .insert({
          user_id: user.id,
          latitude: newPoint.latitude,
          longitude: newPoint.longitude,
          title: title.trim(),
          note: note.trim() || ''
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving point:', error);
        toast.error('Errore nel salvare il punto');
        return;
      }

      if (data) {
        setMapPoints(prev => [...prev, data]);
        toast.success('Punto salvato con successo');
      }

      // Reset form
      setNewPoint({ latitude: null, longitude: null });
      setIsAddingPoint(false);
    } catch (error) {
      console.error('Error in savePoint:', error);
      toast.error('Errore nel salvare il punto');
    }
  }, [newPoint, setMapPoints]);

  const updateMapPoint = useCallback(async (id: string, title: string, note: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('map_points')
        .update({ title: title.trim(), note: note.trim() })
        .eq('id', id);

      if (error) {
        console.error('Error updating point:', error);
        toast.error('Errore nell\'aggiornare il punto');
        return false;
      }

      setMapPoints(prev => prev.map(point => 
        point.id === id ? { ...point, title: title.trim(), note: note.trim() } : point
      ));
      toast.success('Punto aggiornato con successo');
      return true;
    } catch (error) {
      console.error('Error in updateMapPoint:', error);
      toast.error('Errore nell\'aggiornare il punto');
      return false;
    }
  }, [setMapPoints]);

  const deleteMapPoint = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('map_points')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting point:', error);
        toast.error('Errore nell\'eliminare il punto');
        return false;
      }

      setMapPoints(prev => prev.filter(point => point.id !== id));
      toast.success('Punto eliminato con successo');
      return true;
    } catch (error) {
      console.error('Error in deleteMapPoint:', error);
      toast.error('Errore nell\'eliminare il punto');
      return false;
    }
  }, [setMapPoints]);

  // BUZZ MAPPA functionality - generates search area using existing logic
  const handleBuzz = useCallback(() => {
    console.log("Executing BUZZ MAPPA - generating search area...");
    
    // Use the generateSearchArea function
    const areaId = generateSearchArea();
    
    if (areaId) {
      console.log("Search area generated successfully with ID:", areaId);
      toast.success("Area di ricerca BUZZ generata sulla mappa!", {
        description: "Controlla la nuova area cerchiata sulla mappa"
      });
    } else {
      console.error("Failed to generate search area");
      toast.error("Errore nella generazione dell'area di ricerca");
    }
  }, [generateSearchArea]);

  const requestLocationPermission = useCallback(async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      toast.success('Posizione ottenuta con successo');
      return [position.coords.latitude, position.coords.longitude] as [number, number];
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Impossibile ottenere la posizione');
      return null;
    }
  }, []);

  return {
    mapPoints,
    isAddingPoint,
    setIsAddingPoint,
    newPoint,
    activeMapPoint,
    setActiveMapPoint,
    addNewPoint,
    savePoint,
    updateMapPoint,
    deleteMapPoint,
    handleBuzz, // This connects to the BUZZ MAPPA button
    requestLocationPermission,
    // Search areas - spread all properties from searchAreasLogic
    ...searchAreasLogic,
    generateSearchArea // Add the generateSearchArea function
  };
};
