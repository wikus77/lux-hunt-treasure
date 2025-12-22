// @ts-nocheck
// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { SearchArea } from "@/components/maps/types";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/integrations/supabase/client";
import { safeLatLng } from "@/pages/map/utils/safeLatLng";
export function useSearchAreasLogic(defaultLocation: [number, number]) {
  const DEV_MOCKS = import.meta.env.VITE_MAP3D_DEV_MOCKS === 'true';
  const [storageAreas, setStorageAreas] = useLocalStorage<SearchArea[]>("map-search-areas", []);
  const [searchAreas, setSearchAreas] = useState<SearchArea[]>([]);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const pendingRadiusRef = useRef<number>(500);
  const [searchAreasThisWeek, setSearchAreasThisWeek] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // CRITICAL FIX: Force reload areas from database
  const forceReloadAreas = async () => {
    console.log("🔄 FORCE RELOAD: Starting areas reload from database");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id) {
        console.log("❌ No authenticated user, using local storage areas only");
        setSearchAreas(storageAreas || []);
        setIsLoading(false);
        return;
      }
      
      console.log("🔄 FORCE RELOAD: Fetching search areas for user:", sessionData.session.user.id);
      const { data: areasData, error } = await supabase
        .from('search_areas')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("❌ FORCE RELOAD: Error fetching search areas:", error);
        setSearchAreas(storageAreas || []);
        setIsLoading(false);
        return;
      }
      
      if (areasData && areasData.length > 0) {
        console.log("✅ FORCE RELOAD: Search areas loaded from Supabase:", areasData);
        const areas: SearchArea[] = areasData.map(area => ({
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius: area.radius,
          label: area.label || `Area di ricerca`,
          position: { lat: area.lat, lng: area.lng },
          color: "#00f0ff"
        }));
        setSearchAreas(areas);
        setSearchAreasThisWeek(areasData.length);
        console.log("📊 FORCE RELOAD: Total areas loaded and set:", areas.length);
      } else {
        console.log("📝 FORCE RELOAD: No search areas found in database");
        setSearchAreas([]);
      }
    } catch (error) {
      console.error("❌ FORCE RELOAD: Exception in forceReloadAreas:", error);
      setSearchAreas(storageAreas || []);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user's search areas from Supabase on mount
  useEffect(() => {
    console.log("🚀 INITIAL LOAD: Component mounted, loading areas");
    forceReloadAreas();
  }, []); // Remove storageAreas dependency to avoid loops

  // 🔥 V2: Listen for mission reset to clear all areas
  useEffect(() => {
    const handleMissionReset = () => {
      console.log('🚀 useSearchAreasLogic: Mission reset event received, clearing all areas...');
      setSearchAreas([]);
      setStorageAreas([]);
      setActiveSearchArea(null);
      setSearchAreasThisWeek(0);
      // Clear localStorage explicitly
      try {
        localStorage.removeItem('map-search-areas');
        console.log('🗑️ useSearchAreasLogic: Cleared localStorage map-search-areas');
      } catch (e) {
        console.warn('⚠️ useSearchAreasLogic: Failed to clear localStorage:', e);
      }
    };

    window.addEventListener('missionLaunched', handleMissionReset);
    window.addEventListener('missionReset', handleMissionReset);
    window.addEventListener('mission:reset', handleMissionReset);
    
    return () => {
      window.removeEventListener('missionLaunched', handleMissionReset);
      window.removeEventListener('missionReset', handleMissionReset);
      window.removeEventListener('mission:reset', handleMissionReset);
    };
  }, [setStorageAreas]);

  // Sync areas with localStorage only when areas change from user actions
  useEffect(() => {
    if (!isLoading && searchAreas.length >= 0) {
      setStorageAreas(searchAreas);
      console.log("💾 SYNC: Updated search areas in localStorage:", searchAreas.length);
    }
  }, [searchAreas, setStorageAreas, isLoading]);

  // Calculate radius based on number of areas created this week
  const calculateRadius = () => {
    const baseRadius = 100000;
    const decreaseFactor = Math.pow(0.95, searchAreasThisWeek);
    const calculatedRadius = Math.max(5000, baseRadius * decreaseFactor);
    console.log(`📏 RADIUS: Calculated radius: ${calculatedRadius}m (${calculatedRadius/1000}km), areas this week: ${searchAreasThisWeek}`);
    return calculatedRadius;
  };

  const handleAddArea = (radius?: number) => {
    const calculatedRadius = radius || calculateRadius();
    pendingRadiusRef.current = calculatedRadius;
    
    setIsAddingSearchArea(true);
    console.log("🎯 ADD MODE: Search area mode activated, cursor changed to crosshair");
    toast.info("Clicca sulla mappa per aggiungere una nuova area di ricerca", {
      description: `L'area sarà creata con il raggio di ${(pendingRadiusRef.current/1000).toFixed(1)} km`
    });
  };

  const handleMapClickArea = async (e: any) => {
    if (!isAddingSearchArea) {
      if (import.meta.env.DEV) console.log("❌ INVALID: Not in adding search area mode");
      return;
    }

    const ll = safeLatLng(e);
    if (!ll) {
      if (import.meta.env.DEV) console.warn('Layer skipped: missing lat/lng', { comp: 'useSearchAreasLogic.handleMapClickArea' });
      return; // early exit, no fallback here
    }

    try {
      const lat = ll.lat;
      const lng = ll.lng;
      const radius = pendingRadiusRef.current;

      if (import.meta.env.DEV) {
        console.groupCollapsed('🗺️ MAP CLICK -> create area');
        console.log({ lat, lng, radius });
        console.groupEnd();
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        console.error("❌ AUTH: User not authenticated");
        if (DEV_MOCKS) {
          // DEV fallback: store locally
          const newAreaLocal: SearchArea = {
            id: uuidv4(),
            lat,
            lng,
            radius,
            label: `Area di ricerca ${searchAreasThisWeek + 1}`,
            color: "#00f0ff",
            position: { lat, lng }
          };
          setSearchAreas(prev => [...prev, newAreaLocal]);
          setActiveSearchArea(newAreaLocal.id);
          setIsAddingSearchArea(false);
          toast.success("Area di ricerca aggiunta (DEV locale)", { description: `Raggio: ${(radius/1000).toFixed(1)} km` });
          return;
        }
        toast.error("Utente non autenticato");
        setIsAddingSearchArea(false);
        return;
      }

      const userId = sessionData.session.user.id;

      const newArea: SearchArea = {
        id: uuidv4(),
        lat,
        lng,
        radius,
        label: `Area di ricerca ${searchAreasThisWeek + 1}`,
        color: "#00f0ff",
        position: { lat, lng }
      };

      const { data, error } = await supabase
        .from('search_areas')
        .insert({
          user_id: userId,
          lat,
          lng,
          radius,
          label: newArea.label
        })
        .select()
        .single();

      if (error) {
        console.error("❌ DB ERROR: Error saving search area:", error);
        if (DEV_MOCKS) {
          // DEV fallback: persist locally when DB write fails
          setSearchAreasThisWeek(prev => prev + 1);
          setSearchAreas(prevAreas => [...prevAreas, newArea]);
          setActiveSearchArea(newArea.id);
          setIsAddingSearchArea(false);
          toast.success("Area di ricerca aggiunta (DEV locale)", { description: `Raggio: ${(radius/1000).toFixed(1)} km` });
          return;
        }
        toast.error("Si è verificato un errore nel salvare l'area di ricerca");
        setIsAddingSearchArea(false);
        return;
      }

      if (data) newArea.id = data.id;

      setSearchAreasThisWeek(prev => prev + 1);
      setSearchAreas(prevAreas => [...prevAreas, newArea]);
      setActiveSearchArea(newArea.id);
      setIsAddingSearchArea(false);
      toast.success("Area di ricerca aggiunta alla mappa", { description: `Raggio: ${(radius/1000).toFixed(1)} km` });

      // Ensure consistency
      setTimeout(() => { forceReloadAreas(); }, 500);
    } catch (error) {
      console.error("❌ EXCEPTION: Error adding search area:", error);
      setIsAddingSearchArea(false);
      toast.error("Si è verificato un errore nell'aggiunta dell'area");
    }
  };

  const saveSearchArea = (id: string, label: string, radius: number) => {
    console.log("💾 SAVE: Saving search area:", id, label, radius);
    setSearchAreas(searchAreas.map(area =>
      area.id === id ? { ...area, label, radius } : area
    ));
    toast.success("Area di ricerca aggiornata");
  };

  const deleteSearchArea = async (id: string) => {
    console.log("🗑️ DELETE: Starting deletion of search area:", id);
    
    try {
      // Delete from Supabase first
      console.log("🗑️ DB DELETE: Deleting from database");
      const { error } = await supabase
        .from('search_areas')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("❌ DB DELETE ERROR: Error deleting search area:", error);
        if (DEV_MOCKS) {
          // DEV fallback: remove locally when DB delete fails
          setSearchAreas(prevAreas => prevAreas.filter(area => area.id !== id));
          if (activeSearchArea === id) setActiveSearchArea(null);
          toast.success("Area di ricerca rimossa (DEV locale)");
          return true;
        }
        toast.error("Errore nell'eliminare l'area di ricerca");
        return false;
      }
      
      console.log("✅ DB DELETE SUCCESS: Area deleted from database");
      
      // Update local state immediately
      setSearchAreas(prevAreas => {
        const filteredAreas = prevAreas.filter(area => area.id !== id);
        console.log("📝 DELETE STATE: Areas before deletion:", prevAreas.length);
        console.log("📝 DELETE STATE: Areas after deletion:", filteredAreas.length);
        return filteredAreas;
      });
      
      // Clear active area if it was the deleted one
      if (activeSearchArea === id) {
        setActiveSearchArea(null);
        console.log("🎯 ACTIVE CLEAR: Cleared active search area");
      }
      
      toast.success("Area di ricerca rimossa");
      
      // CRITICAL: Force reload to ensure consistency
      console.log("🔄 DELETE REFRESH: Force reloading areas after deletion");
      setTimeout(() => {
        forceReloadAreas();
      }, 300);
      
      return true;
    } catch (error) {
      console.error("❌ DELETE EXCEPTION: Error in deleteSearchArea:", error);
      toast.error("Errore nell'eliminare l'area di ricerca");
      return false;
    }
  };

  const clearAllSearchAreas = () => {
    console.log("🧹 CLEAR ALL: Clearing all search areas");
    setSearchAreas([]);
    setActiveSearchArea(null);
    toast.success("Tutte le aree di ricerca sono state rimosse");
  };

  const toggleAddingSearchArea = () => {
    setIsAddingSearchArea(prev => !prev);
    if (!isAddingSearchArea) {
      const radius = calculateRadius();
      pendingRadiusRef.current = radius;
      toast.info(`Clicca sulla mappa per creare un'area di ricerca (raggio: ${(radius/1000).toFixed(1)}km)`);
    }
  };

  // 🔥 FIX: Direct area creation with coordinates (prevents double area bug)
  const createAreaDirect = async (radius: number, lat: number, lng: number) => {
    console.log("🎯 CREATE DIRECT: Creating area directly with coordinates", { radius, lat, lng });
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        console.error("❌ AUTH: User not authenticated");
        if (DEV_MOCKS) {
          const newAreaLocal: SearchArea = {
            id: uuidv4(),
            lat,
            lng,
            radius,
            label: `Area di ricerca ${searchAreasThisWeek + 1}`,
            color: "#00f0ff",
            position: { lat, lng }
          };
          setSearchAreas(prev => [...prev, newAreaLocal]);
          setActiveSearchArea(newAreaLocal.id);
          return;
        }
        toast.error("Utente non autenticato");
        return;
      }

      const userId = sessionData.session.user.id;

      const newArea: SearchArea = {
        id: uuidv4(),
        lat,
        lng,
        radius,
        label: `Area di ricerca ${searchAreasThisWeek + 1}`,
        color: "#00f0ff",
        position: { lat, lng }
      };

      const { data, error } = await supabase
        .from('search_areas')
        .insert({
          user_id: userId,
          lat,
          lng,
          radius,
          label: newArea.label
        })
        .select()
        .single();

      if (error) {
        console.error("❌ DB ERROR: Error saving search area:", error);
        if (DEV_MOCKS) {
          setSearchAreasThisWeek(prev => prev + 1);
          setSearchAreas(prevAreas => [...prevAreas, newArea]);
          setActiveSearchArea(newArea.id);
          return;
        }
        toast.error("Si è verificato un errore nel salvare l'area di ricerca");
        return;
      }

      if (data) newArea.id = data.id;

      setSearchAreasThisWeek(prev => prev + 1);
      setSearchAreas(prevAreas => [...prevAreas, newArea]);
      setActiveSearchArea(newArea.id);
      console.log("✅ CREATE DIRECT: Area created successfully", newArea.id);

      // Ensure consistency
      setTimeout(() => { forceReloadAreas(); }, 500);
    } catch (error) {
      console.error("❌ EXCEPTION: Error in createAreaDirect:", error);
      toast.error("Si è verificato un errore nell'aggiunta dell'area");
    }
  };

  return {
    searchAreas,
    setSearchAreas,
    activeSearchArea,
    setActiveSearchArea,
    isAddingSearchArea,
    setIsAddingSearchArea,
    handleAddArea,
    handleMapClickArea,
    saveSearchArea,
    deleteSearchArea,
    clearAllSearchAreas,
    toggleAddingSearchArea,
    isLoading,
    forceReloadAreas, // Export for manual refresh
    createAreaDirect, // 🔥 NEW: Direct creation to prevent double area bug
    setPendingRadius: (radius: number) => {
      pendingRadiusRef.current = radius;
    }
  };
}
