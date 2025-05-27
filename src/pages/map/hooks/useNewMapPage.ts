
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
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  const defaultLocation: [number, number] = [41.9028, 12.4964]; // Rome, Italy

  // Use search areas logic with validated default location
  const searchAreasLogic = useSearchAreasLogic(defaultLocation);

  // Get current map center or use fallback coordinates
  const getValidCoordinates = useCallback((): [number, number] => {
    // Priority: current location > default location
    if (currentLocation && currentLocation[0] && currentLocation[1]) {
      return currentLocation;
    }
    return defaultLocation;
  }, [currentLocation]);

  // Generate search area function with coordinate validation
  const generateSearchArea = useCallback(() => {
    try {
      console.log("Generating search area from BUZZ MAPPA button...");
      
      // Get validated coordinates
      const [lat, lng] = getValidCoordinates();
      
      // Validate coordinates before proceeding
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        console.error("Invalid coordinates:", { lat, lng });
        toast.error("Errore nella posizione. Impossibile generare l'area di ricerca.", {
          description: "Ricarica la pagina o concedi i permessi di geolocalizzazione"
        });
        return null;
      }

      console.log("Using validated coordinates:", { lat, lng });
      
      // Calculate radius based on existing areas this week
      const calculatedRadius = searchAreasLogic.calculateRadius ? searchAreasLogic.calculateRadius() : 100000; // 100km default
      
      // Validate radius
      if (!calculatedRadius || calculatedRadius <= 0) {
        console.error("Invalid radius calculated:", calculatedRadius);
        toast.error("Errore nel calcolo del raggio area");
        return null;
      }

      // Set the pending radius
      searchAreasLogic.setPendingRadius(calculatedRadius);
      
      // Generate area directly with validated coordinates
      if (searchAreasLogic.generateSearchArea) {
        const areaId = searchAreasLogic.generateSearchArea(calculatedRadius);
        
        if (areaId) {
          console.log(`Search area generated successfully with ID: ${areaId}, coords: ${lat}, ${lng}, radius: ${calculatedRadius/1000}km`);
          toast.success("Area di ricerca BUZZ generata sulla mappa!", {
            description: `Raggio: ${(calculatedRadius/1000).toFixed(1)}km - Posizione: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
          });
          return areaId;
        }
      }
      
      // Fallback: activate manual placement mode
      searchAreasLogic.setIsAddingSearchArea(true);
      
      console.log(`Search area generation initiated with radius: ${calculatedRadius/1000}km`);
      toast.info("Clicca sulla mappa per posizionare l'area di ricerca BUZZ", {
        description: `Raggio: ${(calculatedRadius/1000).toFixed(1)}km`
      });
      
      return Date.now().toString();
    } catch (error) {
      console.error("Error generating search area:", error);
      toast.error("Errore nella generazione dell'area di ricerca", {
        description: "Controlla la console per dettagli"
      });
      return null;
    }
  }, [searchAreasLogic, getValidCoordinates]);

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
    // Validate coordinates before adding point
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      toast.error("Coordinate non valide per il nuovo punto");
      return;
    }
    
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

  // BUZZ MAPPA functionality - generates search area using validated coordinates
  const handleBuzz = useCallback(() => {
    console.log("Executing BUZZ MAPPA - generating search area...");
    
    // Use the generateSearchArea function with coordinate validation
    const areaId = generateSearchArea();
    
    if (areaId) {
      console.log("Search area generated successfully with ID:", areaId);
      // Success message already shown in generateSearchArea
    } else {
      console.error("Failed to generate search area - check coordinates and permissions");
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

      const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
      setCurrentLocation(newLocation);
      
      toast.success('Posizione ottenuta con successo', {
        description: `Lat: ${newLocation[0].toFixed(4)}, Lng: ${newLocation[1].toFixed(4)}`
      });
      
      return newLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Impossibile ottenere la posizione', {
        description: 'Verrà utilizzata la posizione predefinita (Roma)'
      });
      
      // Set default location if geolocation fails
      setCurrentLocation(defaultLocation);
      return defaultLocation;
    }
  }, [defaultLocation]);

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
    handleBuzz, // This connects to the BUZZ MAPPA button with coordinate validation
    requestLocationPermission,
    currentLocation, // Export current location for use in components
    // Search areas - spread all properties from searchAreasLogic
    ...searchAreasLogic,
    generateSearchArea // Add the validated generateSearchArea function
  };
};
