import { useState, useCallback, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MapMarker } from '@/components/maps/types';

// Define a default location constant to be used across the application
export const DEFAULT_LOCATION = { lat: 41.9028, lng: 12.4964 }; // Rome, Italy

export function useMapLogic() {
  const [mapPoints, setMapPoints] = useState<MapMarker[]>([]);
  const [isAddingMapPoint, setIsAddingMapPoint] = useState(false);
  const [activeMapPoint, setActiveMapPoint] = useState<string | null>(null);
  
  // Search areas related state
  const [searchAreas, setSearchAreas] = useState<any[]>([]);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [pendingRadius, setPendingRadius] = useState<number>(500);
  
  // Buzz related properties
  const buzzMapPrice = 1.99; // Default price

  // Debug the state of isAddingMapPoint
  useEffect(() => {
    console.log("Estado de isAddingMapPoint cambió a:", isAddingMapPoint);
  }, [isAddingMapPoint]);
  
  // Add a new map point
  const addMapPoint = async (point: { lat: number; lng: number; title: string; note: string }) => {
    try {
      console.log("Tentativo di aggiungere un nuovo punto:", point);
      
      // Get the current user first
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        console.error("Utente non autenticato");
        toast.error('Utente non autenticato');
        return null;
      }
      
      console.log("Inserendo punto in database per utente:", userId);
      const { data, error } = await supabase
        .from('map_points')
        .insert({
          latitude: point.lat,
          longitude: point.lng,
          title: point.title,
          note: point.note,
          user_id: userId
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error adding map point:', error);
        toast.error('Errore nel salvare il punto di interesse');
        return null;
      }
      
      console.log("Punto inserito con successo:", data);
      const newPoint: MapMarker = {
        id: data.id,
        lat: data.latitude,
        lng: data.longitude,
        note: data.note || '',
        title: data.title,
        position: { lat: data.latitude, lng: data.longitude },
        createdAt: new Date(data.created_at)
      };
      
      setMapPoints(prev => [...prev, newPoint]);
      toast.success('Punto di interesse salvato');
      return newPoint.id;
    } catch (error) {
      console.error('Error in addMapPoint:', error);
      toast.error('Errore nel salvare il punto di interesse');
      return null;
    }
  };

  // Update an existing map point
  const updateMapPoint = async (id: string, updates: { title?: string; note?: string }) => {
    try {
      const { error } = await supabase
        .from('map_points')
        .update({
          title: updates.title,
          note: updates.note
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating map point:', error);
        toast.error('Errore nell\'aggiornare il punto di interesse');
        return false;
      }
      
      // Update the local state
      setMapPoints(prev => prev.map(point => 
        point.id === id 
          ? { ...point, title: updates.title || point.title, note: updates.note || point.note } 
          : point
      ));
      
      toast.success('Punto di interesse aggiornato');
      return true;
    } catch (error) {
      console.error('Error in updateMapPoint:', error);
      toast.error('Errore nell\'aggiornare il punto di interesse');
      return false;
    }
  };

  // Delete a map point
  const deleteMapPoint = async (id: string) => {
    try {
      const { error } = await supabase
        .from('map_points')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting map point:', error);
        toast.error('Errore nell\'eliminare il punto di interesse');
        return false;
      }
      
      // Update the local state
      setMapPoints(prev => prev.filter(point => point.id !== id));
      
      toast.success('Punto di interesse eliminato');
      return true;
    } catch (error) {
      console.error('Error in deleteMapPoint:', error);
      toast.error('Errore nell\'eliminare il punto di interesse');
      return false;
    }
  };

  // Toggle adding map point state
  const toggleAddingMapPoint = useCallback(() => {
    setIsAddingMapPoint(prev => {
      const newState = !prev;
      console.log("TOGGLE isAddingMapPoint:", prev, "→", newState);
      
      // If we're enabling map point mode, disable search area mode
      if (newState) {
        setIsAddingSearchArea(false);
        
        // Show toast instructions
        toast.info('Clicca sulla mappa per posizionare un nuovo punto di interesse');
      }
      
      return newState;
    });
  }, []);

  // Stub functions for search areas
  const handleMapClickArea = (e: any) => {
    console.log("Map area click", e);
    setIsAddingSearchArea(false);
  };
  
  const deleteSearchArea = (id: string) => {
    setSearchAreas(prev => prev.filter(area => area.id !== id));
  };
  
  // Buzz related functions
  const handleBuzz = () => {
    toast.info('Funzionalità BUZZ non ancora implementata');
  };

  // Request location permission and handle geolocation
  const requestLocationPermission = useCallback(async () => {
    try {
      // First check if we have permission
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        
        if (permissionStatus.state === 'denied') {
          toast.error('Geolocalizzazione disattivata. Attiva la posizione per usare questa funzione.');
          return;
        }
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Handle successful geolocation
          const { latitude, longitude } = position.coords;
          // Implementation details here
          console.log('Location obtained:', latitude, longitude);
          toast.success('Posizione ottenuta');
        },
        (error) => {
          // Don't retry if user denied permission
          if (error.code === 1) { // 1 = PERMISSION_DENIED
            toast.error('Geolocalizzazione disattivata. Attiva la posizione per usare questa funzione.');
            return;
          }
          
          console.error('Geolocation error:', error);
          toast.error('Errore nella geolocalizzazione');
        }
      );
    } catch (error) {
      console.error('Location permission error:', error);
      toast.error('Errore nella richiesta di posizione');
    }
  }, []);

  // Load map points on component mount
  useEffect(() => {
    const loadMapPoints = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        
        if (!userId) {
          console.log('User not authenticated, skipping map points load');
          return;
        }
        
        console.log("Caricamento punti mappa per utente:", userId);
        const { data, error } = await supabase
          .from('map_points')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error loading map points:', error);
          return;
        }
        
        console.log("Punti mappa caricati:", data?.length || 0);
        
        // Transform the data to match our MapMarker type
        const points: MapMarker[] = data.map(point => ({
          id: point.id,
          lat: point.latitude,
          lng: point.longitude,
          title: point.title,
          note: point.note || '',
          position: { lat: point.latitude, lng: point.longitude },
          createdAt: new Date(point.created_at)
        }));
        
        setMapPoints(points);
      } catch (error) {
        console.error('Error in loadMapPoints:', error);
      }
    };
    
    loadMapPoints();
  }, []);

  return {
    mapPoints,
    isAddingMapPoint,
    setIsAddingMapPoint,
    activeMapPoint,
    setActiveMapPoint,
    addMapPoint,
    updateMapPoint,
    deleteMapPoint,
    toggleAddingMapPoint,
    requestLocationPermission,
    // Include the missing properties:
    searchAreas,
    isAddingSearchArea,
    activeSearchArea,
    setActiveSearchArea,
    handleMapClickArea,
    deleteSearchArea,
    setPendingRadius,
    buzzMapPrice,
    handleBuzz
  };
}
