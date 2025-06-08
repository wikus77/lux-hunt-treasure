import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useSearchAreasLogic } from './useSearchAreasLogic';
import { MapMarker } from '@/components/maps/types';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';

// UUID di fallback per sviluppo - SOLUZIONE DEFINITIVA
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

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

  // FIXED: Ottieni user_id valido per Supabase - SOLUZIONE DEFINITIVA
  const getValidUserId = useCallback(() => {
    if (!user?.id) return null;
    // Se è developer-fake-id, usa l'UUID di fallback
    return user.id === 'developer-fake-id' ? DEVELOPER_UUID : user.id;
  }, [user]);

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

  // FIXED: Fetch existing map points on mount con gestione RLS
  useEffect(() => {
    const fetchMapPoints = async () => {
      const validUserId = getValidUserId();
      if (!validUserId) {
        console.log("❌ No valid user ID available for fetching map points");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("📍 Fetching map points for user:", validUserId);
        
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
    if (!validUserId) {
      toast.error("Accesso non valido per aggiungere punti");
      return;
    }

    // Se è developer mode, mostra un toast informativo
    if (user?.id === 'developer-fake-id') {
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
  }, [isAddingSearchArea, toggleAddingSearchArea, getValidUserId, user]);

  // FIXED: Save the point to Supabase con validazione completa e UUID corretto
  const savePoint = async (title: string, note: string) => {
    const validUserId = getValidUserId();
    if (!newPoint || !validUserId) {
      console.log("❌ Cannot save point: missing newPoint or valid user ID");
      toast.error("Impossibile salvare: punto o utente non valido");
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
        
        // FIXED: Messaggi più specifici in base al tipo di errore
        if (error.code === 'PGRST116') {
          toast.error("Errore di accesso: verificare autenticazione");
        } else if (error.message.includes('row-level security')) {
          toast.error("Errore di sicurezza: verifica permessi utente");
        } else {
          toast.error(`Errore nel salvare il punto: ${error.message}`);
        }
        return;
      }

      if (!data || data.length === 0) {
        console.error("❌ No data returned from insert");
        toast.error("Errore nel salvare il punto: nessun dato restituito");
        return;
      }

      console.log("✅ Successfully saved new point:", data[0]);
      
      // Messaggio diverso per developer mode
      if (user?.id === 'developer-fake-id') {
        toast.success("Punto salvato (modalità sviluppatore)");
      } else {
        toast.success("Punto salvato con successo");
      }
      
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
    if (!validUserId) {
      toast.error("Accesso non valido per modificare punti");
      return false;
    }
    
    // FIXED: Validazione con trim
    const trimmedTitle = title?.trim() || '';
    const trimmedNote = note?.trim() || '';
    
    if (!trimmedTitle) {
      toast.error("Il titolo è obbligatorio");
      return false;
    }
    
    try {
      console.log("📝 Updating map point:", id, trimmedTitle, trimmedNote);

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
    if (!validUserId) {
      toast.error("Accesso non valido per eliminare punti");
      return false;
    }
    
    try {
      console.log("🗑️ Deleting map point:", id);

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

  // FIXED: Handle BUZZ button click con validazione user ID
  const handleBuzz = useCallback(() => {
    const validUserId = getValidUserId();
    if (!validUserId) {
      toast.error("Accesso non valido per generare area BUZZ");
      return;
    }

    // Messaggio informativo per developer mode
    if (user?.id === 'developer-fake-id') {
      toast.info("Modalità sviluppatore: generazione BUZZ simulata", {
        description: "Area creata con ID sviluppatore"
      });
    }

    const activeArea = getActiveArea();
    if (activeArea) {
      toast.success(`Area BUZZ MAPPA attiva: ${activeArea.radius_km.toFixed(1)} km`, {
        description: "L'area è già visibile sulla mappa"
      });
      console.log('📏 Messaggio popup con raggio ESATTO da Supabase:', activeArea.radius_km.toFixed(1), 'km');
    } else {
      toast.info("Premi BUZZ MAPPA per generare una nuova area di ricerca!");
    }
  }, [getActiveArea, getValidUserId, user]);

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
