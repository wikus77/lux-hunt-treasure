
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
  const [pendingRadius, setPendingRadius] = useState<number>(100000); // 100km default radius
  const [currentWeekAreaCount, setCurrentWeekAreaCount] = useState<number>(0);
  
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
  const updateMapPoint = async (id: string, updates: { title?: string; note?: string }): Promise<void> => {
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
        return;
      }
      
      // Update the local state
      setMapPoints(prev => prev.map(point => 
        point.id === id 
          ? { ...point, title: updates.title || point.title, note: updates.note || point.note } 
          : point
      ));
      
      toast.success('Punto di interesse aggiornato');
    } catch (error) {
      console.error('Error in updateMapPoint:', error);
      toast.error('Errore nell\'aggiornare il punto di interesse');
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

  // Toggle adding search area state
  const toggleAddingSearchArea = useCallback(() => {
    setIsAddingSearchArea(prev => {
      const newState = !prev;
      
      // If we're enabling search area mode, disable map point mode
      if (newState) {
        setIsAddingMapPoint(false);
        
        // Calculate the current radius based on the number of areas created
        const radius = Math.max(5000, 100000 * Math.pow(0.95, currentWeekAreaCount)); // Minimum 5km
        setPendingRadius(radius);
        
        // Show toast instructions with the current radius
        toast.info(`Clicca sulla mappa per creare un'area di ricerca (raggio: ${(radius/1000).toFixed(1)}km)`);
      }
      
      return newState;
    });
  }, [currentWeekAreaCount]);

  // Handle map click for search area
  const handleMapClickArea = async (e: any) => {
    if (!isAddingSearchArea) return;
    
    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        toast.error('Utente non autenticato');
        return;
      }
      
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const radius = pendingRadius;
      
      console.log("Creando area di ricerca:", { lat, lng, radius });
      
      // Save to database
      const { data, error } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: userId,
          lat: lat,
          lng: lng,
          radius_km: radius / 1000, // Convert to km for storage
          week: getCurrentWeek() // Current week function (implementation below)
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding search area:', error);
        toast.error('Errore nel creare l\'area di ricerca');
        return;
      }
      
      // Create the area object for local state
      const newArea = {
        id: data.id,
        lat: data.lat,
        lng: data.lng,
        radius: data.radius_km * 1000, // Convert back to meters for display
        label: `Area di ricerca ${searchAreas.length + 1}`,
        color: '#00f0ff', // Neon blue as specified
        position: { lat: data.lat, lng: data.lng }
      };
      
      // Add to local state
      setSearchAreas(prev => [...prev, newArea]);
      
      // Update the count of areas created this week
      setCurrentWeekAreaCount(prev => prev + 1);
      
      // Turn off adding mode
      setIsAddingSearchArea(false);
      
      toast.success('Area di ricerca creata');
    } catch (error) {
      console.error('Error in handleMapClickArea:', error);
      toast.error('Errore nel creare l\'area di ricerca');
      setIsAddingSearchArea(false);
    }
  };
  
  // Simple function to get current week number 
  // (placeholder - you might want to sync with your business logic)
  const getCurrentWeek = () => {
    return 1; // For simplicity, always return week 1
  };
  
  const deleteSearchArea = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting search area:', error);
        toast.error('Errore nell\'eliminare l\'area di ricerca');
        return false;
      }
      
      // Update the local state
      setSearchAreas(prev => prev.filter(area => area.id !== id));
      
      toast.success('Area di ricerca eliminata');
      return true;
    } catch (error) {
      console.error('Error in deleteSearchArea:', error);
      toast.error('Errore nell\'eliminare l\'area di ricerca');
      return false;
    }
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

  // Load map points and search areas on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        
        if (!userId) {
          console.log('User not authenticated, skipping data load');
          return;
        }
        
        // Load map points
        const { data: pointsData, error: pointsError } = await supabase
          .from('map_points')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (pointsError) {
          console.error('Error loading map points:', pointsError);
        } else {
          console.log("Punti mappa caricati:", pointsData?.length || 0);
          
          // Transform the data to match our MapMarker type
          const points: MapMarker[] = pointsData.map(point => ({
            id: point.id,
            lat: point.latitude,
            lng: point.longitude,
            title: point.title,
            note: point.note || '',
            position: { lat: point.latitude, lng: point.longitude },
            createdAt: new Date(point.created_at)
          }));
          
          setMapPoints(points);
        }
        
        // Load search areas
        const { data: areasData, error: areasError } = await supabase
          .from('user_map_areas')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (areasError) {
          console.error('Error loading search areas:', areasError);
        } else {
          console.log("Aree di ricerca caricate:", areasData?.length || 0);
          
          // Transform the data for our local state
          const areas = areasData.map((area, index) => ({
            id: area.id,
            lat: area.lat,
            lng: area.lng,
            radius: area.radius_km * 1000, // Convert km to meters for display
            label: `Area di ricerca ${index + 1}`,
            color: '#00f0ff', // Neon blue
            position: { lat: area.lat, lng: area.lng }
          }));
          
          setSearchAreas(areas);
          
          // Count areas for the current week to determine the next radius
          const currentWeekAreas = areasData.filter(area => area.week === getCurrentWeek());
          setCurrentWeekAreaCount(currentWeekAreas.length);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
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
    // Search area related
    searchAreas,
    isAddingSearchArea,
    setIsAddingSearchArea,
    activeSearchArea,
    setActiveSearchArea,
    handleMapClickArea,
    deleteSearchArea,
    toggleAddingSearchArea,
    pendingRadius,
    setPendingRadius,
    // Buzz related
    buzzMapPrice,
    handleBuzz
  };
}
