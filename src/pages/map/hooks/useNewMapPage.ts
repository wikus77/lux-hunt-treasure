// @ts-nocheck
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - Map Page Hook - Compatibile Capacitor iOS
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { useSearchAreasLogic } from './useSearchAreasLogic';
import { MapMarker } from '@/components/maps/types';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useBuzzApi } from '@/hooks/buzz/useBuzzApi';

// UUID di fallback per sviluppo - SOLUZIONE DEFINITIVA
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export const useNewMapPage = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [mapPoints, setMapPoints] = useState<any[]>([]);
  const [newPoint, setNewPoint] = useState<MapMarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMapPoint, setActiveMapPoint] = useState<string | null>(null);
  const buzzMapPrice = 1.99; // Default price, will be updated by backend

  // Default location (Rome, Italy)
  const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

  // FIXED: Ottieni user_id valido per Supabase - SOLUZIONE DEFINITIVA
  const getValidUserId = useCallback(() => {
    if (!user?.id) return DEVELOPER_UUID; // Always return valid UUID
    // Se è developer-fake-id, usa l'UUID di fallback
    return user.id === 'developer-fake-id' ? DEVELOPER_UUID : user.id;
  }, [user]);

  // Integra la logica BUZZ MAPPA
  const { 
    currentWeekAreas, 
    loading: buzzLoading,
    error: buzzError,
    reloadAreas
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

  // FIXED: Fetch existing map points on mount con gestione RLS
  useEffect(() => {
    const fetchMapPoints = async () => {
      const validUserId = getValidUserId();
      
      try {
        console.log("📍 Fetching map points for user:", validUserId);
        
        // CRITICAL FIX: For developer mode, create mock data if needed
        if (validUserId === DEVELOPER_UUID) {
          console.log("🔧 Developer mode: using local storage fallback");
          const localPoints = localStorage.getItem('dev-map-points');
          if (localPoints) {
            setMapPoints(JSON.parse(localPoints));
          }
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('map_points')
          .select('*')
          .eq('user_id', validUserId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("❌ Error fetching map points:", error);
          if (error.code === 'PGRST116') {
            console.log("ℹ️ No map points found or access denied");
            setMapPoints([]);
          } else {
            toast.error(`Errore nel caricamento dei punti: ${error.message}`);
          }
          return;
        }

        console.log("✅ Successfully fetched map points:", data?.length || 0, "points");
        setMapPoints(data || []);
      } catch (err) {
        console.error("❌ Exception fetching map points:", err);
        toast.error("Errore nel caricamento dei punti");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapPoints();
  }, [getValidUserId]);

  // FIXED: Add a new point to the map con validazione user ID
  const addNewPoint = useCallback((lat: number, lng: number) => {
    console.log("📍 Adding new point at:", lat, lng);
    
    const validUserId = getValidUserId();
    
    // ALWAYS allow point creation with valid UUID
    const isDevMode = validUserId === DEVELOPER_UUID;
    if (isDevMode) {
      toast.info("Modalità sviluppatore: inserimento simulato", {
        description: "Punto creato con ID sviluppatore"
      });
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
  }, [isAddingSearchArea, toggleAddingSearchArea, getValidUserId]);

  // FIXED: Save the point to Supabase con validazione completa e UUID corretto
  const savePoint = async (title: string, note: string) => {
    const validUserId = getValidUserId();
    if (!newPoint) {
      console.log("❌ Cannot save point: missing newPoint");
      toast.error("Impossibile salvare: punto non disponibile");
      return;
    }
    
    // FIXED: Validazione rigorosa con trim
    const trimmedTitle = title?.trim() || '';
    const trimmedNote = note?.trim() || '';
    
    if (!trimmedTitle) {
      console.log("❌ Validation failed: empty title after trim");
      toast.error("Il titolo è obbligatorio");
      return;
    }

    // FIXED: Payload completo e validato con UUID corretto
    const payload = {
      user_id: validUserId, // Always use the validated UUID
      latitude: newPoint.lat,
      longitude: newPoint.lng,
      title: trimmedTitle,
      note: trimmedNote
    };

    try {
      console.log("📍 Saving new point with validated payload:", payload);

      // CRITICAL FIX: Handle developer mode with local storage
      if (validUserId === DEVELOPER_UUID) {
        const devPoint = {
          id: crypto.randomUUID(),
          ...payload,
          created_at: new Date().toISOString()
        };
        
        const currentPoints = mapPoints || [];
        const updatedPoints = [devPoint, ...currentPoints];
        setMapPoints(updatedPoints);
        localStorage.setItem('dev-map-points', JSON.stringify(updatedPoints));
        
        console.log("✅ Point saved in developer mode:", devPoint);
        toast.success("Punto salvato (modalità sviluppatore)");
        setNewPoint(null);
        setIsAddingPoint(false);
        return;
      }

      const { data, error } = await supabase
        .from('map_points')
        .insert([payload])
        .select();

      if (error) {
        console.error("❌ Supabase error saving map point:", error);
        console.error("❌ Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        toast.error(`Errore nel salvare il punto: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.error("❌ No data returned from insert");
        toast.error("Errore nel salvare il punto: nessun dato restituito");
        return;
      }

      console.log("✅ Successfully saved new point:", data[0]);
      toast.success("Punto salvato con successo");
      
      // Add the new point to the current list
      setMapPoints(prev => [data[0], ...prev]);
      
      // Reset new point state
      setNewPoint(null);
      setIsAddingPoint(false);
    } catch (err) {
      console.error("❌ Exception saving map point:", err);
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      toast.error(`Errore nell'salvare il punto: ${errorMessage}`);
    }
  };

  // FIXED: Update an existing point con validazione
  const updateMapPoint = async (id: string, title: string, note: string): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    const trimmedTitle = title?.trim() || '';
    const trimmedNote = note?.trim() || '';
    
    if (!trimmedTitle) {
      toast.error("Il titolo è obbligatorio");
      return false;
    }
    
    try {
      console.log("📝 Updating map point:", id, trimmedTitle, trimmedNote);

      // Handle developer mode
      if (validUserId === DEVELOPER_UUID) {
        const currentPoints = [...mapPoints];
        const pointIndex = currentPoints.findIndex(p => p.id === id);
        if (pointIndex >= 0) {
          currentPoints[pointIndex] = { 
            ...currentPoints[pointIndex], 
            title: trimmedTitle, 
            note: trimmedNote 
          };
          setMapPoints(currentPoints);
          localStorage.setItem('dev-map-points', JSON.stringify(currentPoints));
          toast.success("Punto aggiornato (modalità sviluppatore)");
          setActiveMapPoint(null);
          return true;
        }
        return false;
      }

      const { error } = await supabase
        .from('map_points')
        .update({
          title: trimmedTitle,
          note: trimmedNote
        })
        .eq('id', id)
        .eq('user_id', validUserId);

      if (error) {
        console.error("❌ Error updating map point:", error);
        toast.error(`Errore nell'aggiornare il punto: ${error.message}`);
        return false;
      }

      // Update local state
      setMapPoints(prev => prev.map(point => 
        point.id === id ? { ...point, title: trimmedTitle, note: trimmedNote } : point
      ));
      
      toast.success("Punto aggiornato con successo");
      setActiveMapPoint(null);
      return true;
    } catch (err) {
      console.error("❌ Exception updating map point:", err);
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      toast.error(`Errore nell'aggiornare il punto: ${errorMessage}`);
      return false;
    }
  };

  // FIXED: Delete a map point con controllo RLS
  const deleteMapPoint = async (id: string): Promise<boolean> => {
    const validUserId = getValidUserId();
    
    try {
      console.log("🗑️ Deleting map point:", id);

      // Handle developer mode
      if (validUserId === DEVELOPER_UUID) {
        const currentPoints = mapPoints.filter(point => point.id !== id);
        setMapPoints(currentPoints);
        localStorage.setItem('dev-map-points', JSON.stringify(currentPoints));
        setActiveMapPoint(null);
        toast.success("Punto eliminato (modalità sviluppatore)");
        return true;
      }

      const { error } = await supabase
        .from('map_points')
        .delete()
        .eq('id', id)
        .eq('user_id', validUserId);

      if (error) {
        console.error("❌ Error deleting map point:", error);
        toast.error(`Errore nell'eliminare il punto: ${error.message}`);
        return false;
      }

      // Update local state
      setMapPoints(prev => prev.filter(point => point.id !== id));
      setActiveMapPoint(null);
      toast.success("Punto eliminato con successo");
      return true;
    } catch (err) {
      console.error("❌ Exception deleting map point:", err);
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      toast.error(`Errore nell'eliminare il punto: ${errorMessage}`);
      return false;
    }
  };

  // FIXED: Handle BUZZ button click con validazione user ID e API call
  const { callBuzzApi } = useBuzzApi();
  
  const handleBuzz = useCallback(async () => {
    const validUserId = getValidUserId();
    
    console.log('[BUZZ-MAP] Processing BUZZ MAP request for user:', validUserId);
    
    try {
      // Get map center for coordinates
      let mapCenter: { lat: number; lng: number } | undefined;
      if ((window as any).leafletMap) {
        const map = (window as any).leafletMap;
        const center = map.getCenter();
        mapCenter = { lat: center.lat, lng: center.lng };
        console.log('[BUZZ-MAP] Using map center:', mapCenter);
      } else {
        // Default to Rome if no map center available
        mapCenter = { lat: 41.9028, lng: 12.4964 };
        console.log('[BUZZ-MAP] Using default center (Rome):', mapCenter);
      }

      // Call the buzz API with generateMap: true
      const response = await callBuzzApi({
        userId: validUserId,
        generateMap: true,
        coordinates: mapCenter
      });

      if (response.success) {
        console.log('[BUZZ-MAP] BUZZ MAP generated successfully:', response);
        
        if (response.map_area) {
          toast.success(`✅ BUZZ MAPPA creata!`, {
            description: `Area di ${response.map_area.radius_km}km generata`
          });
          
          // Reload areas to show the new one
          await reloadAreas();
        } else {
          toast.success('✅ BUZZ MAP completato con successo!');
        }
      } else {
        console.error('[BUZZ-MAP] API error:', response.errorMessage);
        toast.error(response.errorMessage || 'Errore durante la generazione BUZZ MAP');
      }
    } catch (error) {
      console.error('[BUZZ-MAP] Exception during BUZZ MAP:', error);
      toast.error('Errore imprevisto durante BUZZ MAP');
    }
  }, [getValidUserId, callBuzzApi, reloadAreas]);

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
    buzzMapPrice,
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
    isBuzzGenerating: buzzLoading,
    getActiveArea: () => currentWeekAreas.length > 0 ? currentWeekAreas[0] : null
  };
};
