
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useSearchAreasLogic } from './useSearchAreasLogic';
import { MapMarker } from '@/components/maps/types';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';

export const useNewMapPage = () => {
  const { user } = useAuth();
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [mapPoints, setMapPoints] = useState<any[]>([]);
  const [newPoint, setNewPoint] = useState<MapMarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMapPoint, setActiveMapPoint] = useState<string | null>(null);
  const buzzMapPrice = 1.99;

  // Default location (Rome, Italy)
  const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

  // Integra la logica BUZZ MAPPA
  const { 
    currentWeekAreas, 
    isGenerating: isBuzzGenerating,
    generateBuzzMapArea,
    getActiveArea,
    calculateBuzzMapPrice
  } = useBuzzMapLogic();

  // Initialize search areas logic
  const { 
    searchAreas,
    isAddingSearchArea,
    activeSearchArea,
    setActiveSearchArea,
    handleAddArea,
    handleMapClickArea,
    deleteSearchArea,
    clearAllSearchAreas,
    toggleAddingSearchArea,
    setPendingRadius
  } = useSearchAreasLogic(DEFAULT_LOCATION);

  // Fetch existing map points on mount - FIXED
  useEffect(() => {
    const fetchMapPoints = async () => {
      if (!user?.id) {
        console.log("❌ No user ID available for fetching map points");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("📍 Fetching map points for user:", user.id);
        
        const { data, error } = await supabase
          .from('map_points')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("❌ Error fetching map points:", error);
          toast.error("Errore nel caricamento dei punti");
          return;
        }

        console.log("✅ Successfully fetched map points:", data);
        setMapPoints(data || []);
      } catch (err) {
        console.error("❌ Exception fetching map points:", err);
        toast.error("Errore nel caricamento dei punti");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapPoints();
  }, [user]);

  // Add a new point to the map - FIXED
  const addNewPoint = useCallback((lat: number, lng: number) => {
    console.log("📍 Adding new point at:", lat, lng);
    
    if (!user?.id) {
      toast.error("Devi essere autenticato per aggiungere punti");
      return;
    }

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
    
    toast.success("Punto posizionato. Inserisci titolo e nota.");
  }, [isAddingSearchArea, toggleAddingSearchArea, user]);

  // Save the point to Supabase - FIXED
  const savePoint = async (title: string, note: string) => {
    if (!newPoint || !user?.id) {
      console.log("❌ Cannot save point: missing newPoint or user");
      toast.error("Errore: dati mancanti per salvare il punto");
      return;
    }
    
    // Validation
    if (!title.trim()) {
      toast.error("Il titolo è obbligatorio");
      return;
    }

    try {
      console.log("📍 Saving new point:", {
        user_id: user.id,
        latitude: newPoint.lat,
        longitude: newPoint.lng,
        title: title.trim(),
        note: note.trim()
      });

      const { data, error } = await supabase
        .from('map_points')
        .insert([{
          user_id: user.id,
          latitude: newPoint.lat,
          longitude: newPoint.lng,
          title: title.trim(),
          note: note.trim()
        }])
        .select();

      if (error) {
        console.error("❌ Error saving map point:", error);
        toast.error("Errore nel salvare il punto");
        return;
      }

      console.log("✅ Successfully saved new point:", data);
      toast.success("Punto salvato con successo");
      
      // Add the new point to the current list
      if (data && data.length > 0) {
        setMapPoints(prev => [data[0], ...prev]);
      }
      
      // Reset new point state
      setNewPoint(null);
      setIsAddingPoint(false);
    } catch (err) {
      console.error("❌ Exception saving map point:", err);
      toast.error("Errore nel salvare il punto");
    }
  };

  // Update an existing point - FIXED to return boolean
  const updateMapPoint = async (id: string, title: string, note: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error("Devi essere autenticato per modificare punti");
      return false;
    }
    
    // Validation
    if (!title.trim()) {
      toast.error("Il titolo è obbligatorio");
      return false;
    }
    
    try {
      console.log("📝 Updating map point:", id, title, note);

      const { error } = await supabase
        .from('map_points')
        .update({
          title: title.trim(),
          note: note.trim()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error("❌ Error updating map point:", error);
        toast.error("Errore nell'aggiornare il punto");
        return false;
      }

      // Update local state
      setMapPoints(prev => prev.map(point => 
        point.id === id ? { ...point, title: title.trim(), note: note.trim() } : point
      ));
      
      toast.success("Punto aggiornato con successo");
      setActiveMapPoint(null);
      return true;
    } catch (err) {
      console.error("❌ Exception updating map point:", err);
      toast.error("Errore nell'aggiornare il punto");
      return false;
    }
  };

  // Delete a map point - FIXED
  const deleteMapPoint = async (id: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error("Devi essere autenticato per eliminare punti");
      return false;
    }
    
    try {
      console.log("🗑️ Deleting map point:", id);

      const { error } = await supabase
        .from('map_points')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error("❌ Error deleting map point:", error);
        toast.error("Errore nell'eliminare il punto");
        return false;
      }

      // Update local state
      setMapPoints(prev => prev.filter(point => point.id !== id));
      setActiveMapPoint(null);
      toast.success("Punto eliminato con successo");
      return true;
    } catch (err) {
      console.error("❌ Exception deleting map point:", err);
      toast.error("Errore nell'eliminare il punto");
      return false;
    }
  };

  // Handle BUZZ button click - Updated for BUZZ MAPPA con messaggi allineati
  const handleBuzz = useCallback(() => {
    const activeArea = getActiveArea();
    if (activeArea) {
      // MESSAGGIO ALLINEATO: usa il valore ESATTO salvato in Supabase
      toast.success(`Area BUZZ MAPPA attiva: ${activeArea.radius_km.toFixed(1)} km`, {
        description: "L'area è già visibile sulla mappa"
      });
      console.log('📏 Messaggio popup con raggio ESATTO da Supabase:', activeArea.radius_km.toFixed(1), 'km');
    } else {
      toast.info("Premi BUZZ MAPPA per generare una nuova area di ricerca!");
    }
  }, [getActiveArea]);

  // Request user location
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      toast.info("Rilevamento posizione in corso...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
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
    isAddingPoint,
    setIsAddingPoint,
    mapPoints,
    newPoint,
    isLoading,
    activeMapPoint,
    setActiveMapPoint,
    buzzMapPrice: calculateBuzzMapPrice(),
    searchAreas,
    isAddingSearchArea,
    activeSearchArea,
    setActiveSearchArea,
    handleAddArea,
    handleMapClickArea,
    deleteSearchArea,
    clearAllSearchAreas,
    toggleAddingSearchArea,
    setPendingRadius,
    addNewPoint,
    savePoint,
    updateMapPoint,
    deleteMapPoint,
    handleBuzz,
    requestLocationPermission,
    // Nuove proprietà BUZZ MAPPA
    currentWeekAreas,
    isBuzzGenerating,
    getActiveArea
  };
};
