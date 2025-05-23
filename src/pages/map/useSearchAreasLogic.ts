
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { SearchArea } from "@/components/maps/types";
import { v4 as uuidv4 } from "uuid";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { analyzeCluesForLocation } from "@/utils/clueAnalyzer";
import { useNotifications } from "@/hooks/useNotifications";
import { clues } from "@/data/cluesData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/integrations/supabase/client";

export function useSearchAreasLogic(defaultLocation: [number, number]) {
  const [storageAreas, setStorageAreas] = useLocalStorage<SearchArea[]>("map-search-areas", []);
  const [searchAreas, setSearchAreas] = useState<SearchArea[]>(storageAreas || []);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const { unlockedClues } = useBuzzClues();
  const { notifications } = useNotifications();
  // Add a ref to store the radius temporarily while user selects map location
  const pendingRadiusRef = useRef<number>(500);
  const [currentWeek] = useState<number>(1); // Default to week 1 for now
  const [searchAreasThisWeek, setSearchAreasThisWeek] = useState<number>(0);

  // Sync areas with localStorage
  useEffect(() => {
    setStorageAreas(searchAreas);
    console.log("Updated search areas in localStorage:", searchAreas);
  }, [searchAreas, setStorageAreas]);

  // Load areas count for this week from Supabase on mount
  useEffect(() => {
    const loadAreasCount = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.id) return;

        const { data, error } = await supabase
          .from('user_map_areas')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('week', currentWeek);
        
        if (error) {
          console.error("Error loading search areas count:", error);
          return;
        }

        setSearchAreasThisWeek(data.length || 0);
        console.log(`Loaded ${data.length} search areas for week ${currentWeek}`);
      } catch (error) {
        console.error("Error in loadAreasCount:", error);
      }
    };

    loadAreasCount();
  }, [currentWeek]);

  // Calculate radius based on number of areas created this week
  const calculateRadius = () => {
    // Base radius: 100km = 100,000m
    const baseRadius = 100000;
    // Calculate radius with 5% decrease for each area already created
    // R = R0 * 0.95^N, with minimum of 5000m
    const decreaseFactor = Math.pow(0.95, searchAreasThisWeek);
    const calculatedRadius = Math.max(5000, baseRadius * decreaseFactor);
    console.log(`Calculated radius: ${calculatedRadius}m (${calculatedRadius/1000}km), areas this week: ${searchAreasThisWeek}`);
    return calculatedRadius;
  };

  const handleAddArea = (radius?: number) => {
    // Calculate the radius if not provided
    const calculatedRadius = radius || calculateRadius();
    pendingRadiusRef.current = calculatedRadius;
    
    setIsAddingSearchArea(true);
    console.log("Search area mode activated, cursor changed to crosshair");
    toast.info("Clicca sulla mappa per aggiungere una nuova area di ricerca", {
      description: `L'area sarà creata con il raggio di ${(pendingRadiusRef.current/1000).toFixed(1)} km`
    });
  };

  const handleMapClickArea = async (e: any) => {
    console.log("Map click event received:", e);
    console.log("isAddingSearchArea state:", isAddingSearchArea);

    if (isAddingSearchArea && e.latlng) {
      try {
        // Extract coordinates from the event
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const radius = pendingRadiusRef.current;
        
        console.log("Coordinate selezionate:", lat, lng);
        console.log("Raggio utilizzato:", radius);

        // Get the current user
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        
        if (!userId) {
          console.error("User not authenticated");
          toast.error("Utente non autenticato");
          setIsAddingSearchArea(false);
          return;
        }
        
        // Create new search area object
        const newArea: SearchArea = {
          id: uuidv4(),
          lat, 
          lng,
          radius,
          label: `Area di ricerca ${searchAreasThisWeek + 1}`,
          color: "#00f0ff",
          position: { lat, lng }
        };
        
        console.log("Area generata:", newArea);

        // Save to Supabase
        const { data, error } = await supabase
          .from('user_map_areas')
          .insert({
            user_id: userId,
            lat: lat,
            lng: lng,
            radius_km: radius / 1000, // Convert to km for storage
            week: currentWeek
          })
          .select();

        if (error) {
          console.error("Error saving search area:", error);
          toast.error("Si è verificato un errore nel salvare l'area di ricerca");
          setIsAddingSearchArea(false);
          return;
        }

        console.log("Area saved to Supabase:", data);

        // Update search areas count
        setSearchAreasThisWeek(prev => prev + 1);

        // Update state with the new area
        setSearchAreas(prevAreas => {
          console.log("Aree precedenti:", prevAreas);
          const newAreas = [...prevAreas, newArea];
          console.log("Aree aggiornate:", newAreas);
          return newAreas;
        });

        // Set the newly created area as active
        setActiveSearchArea(newArea.id);
        
        // Reset adding state
        setIsAddingSearchArea(false);
        console.log("Modalità aggiunta area disattivata, cursore ripristinato");
        
        toast.success("Area di ricerca aggiunta alla mappa");
      } catch (error) {
        console.error("Error adding search area:", error);
        setIsAddingSearchArea(false);
        toast.error("Si è verificato un errore nell'aggiunta dell'area");
      }
    } else {
      console.log("Not in adding search area mode or latLng is missing");
    }
  };

  // Generate area from clue with dynamic radius
  const generateSearchArea = (radius?: number) => {
    try {
      // Utilizza l'analizzatore di indizi per determinare la posizione
      const locationInfo = analyzeCluesForLocation(clues, notifications || []);
      
      let targetLat = defaultLocation[0];
      let targetLng = defaultLocation[1];
      let label = "Area generata";
      let confidenceValue: string = "Media"; 
      
      if (locationInfo.lat && locationInfo.lng) {
        targetLat = locationInfo.lat;
        targetLng = locationInfo.lng;
        label = locationInfo.description || "Area basata su indizi";
        
        // Converti la confidenza in italiano
        if (locationInfo.confidence === "alta") confidenceValue = "Alta";
        else if (locationInfo.confidence === "media") confidenceValue = "Media";
        else confidenceValue = "Bassa";
      }

      // Usa il raggio fornito o il valore di default di 500km
      const finalRadius = radius || 500000;

      // Crea l'area di ricerca con stile viola neon
      const newArea: SearchArea = {
        id: uuidv4(),
        lat: targetLat,
        lng: targetLng,
        radius: finalRadius,
        label: label,
        color: "#9b87f5", // Viola neon
        position: { lat: targetLat, lng: targetLng },
        isAI: true,
        confidence: confidenceValue
      };
      
      console.log("Area generata:", newArea);
      setSearchAreas(prev => [...prev, newArea]);
      setActiveSearchArea(newArea.id);
      
      // Log dei dettagli per debug
      console.log("Area generata:", {
        posizione: `${targetLat}, ${targetLng}`,
        label,
        confidence: confidenceValue,
        radius: finalRadius / 1000 + " km"
      });
      
      // Return the ID for the caller if needed
      return newArea.id;
    } catch (error) {
      console.error("Errore nella generazione dell'area:", error);
      toast.error("Impossibile generare l'area di ricerca");
      return null;
    }
  };

  const saveSearchArea = (id: string, label: string, radius: number) => {
    console.log("Saving search area:", id, label, radius);
    setSearchAreas(searchAreas.map(area =>
      area.id === id ? { ...area, label, radius } : area
    ));
    toast.success("Area di ricerca aggiornata");
  };

  const deleteSearchArea = async (id: string) => {
    console.log("Deleting search area:", id);
    
    try {
      // Find the area to delete
      const areaToDelete = searchAreas.find(area => area.id === id);
      if (!areaToDelete) return false;
      
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        toast.error("Utente non autenticato");
        return false;
      }
      
      // Delete from Supabase - trying to match by coordinates since we may not have the DB ID
      const { error } = await supabase
        .from('user_map_areas')
        .delete()
        .eq('user_id', userId)
        .eq('lat', areaToDelete.lat)
        .eq('lng', areaToDelete.lng);
      
      if (error) {
        console.error("Error deleting search area from database:", error);
        // Continue with local deletion even if DB deletion fails
      }
      
      // Update local state
      setSearchAreas(searchAreas.filter(area => area.id !== id));
      if (activeSearchArea === id) setActiveSearchArea(null);
      toast.success("Area di ricerca rimossa");
      return true;
    } catch (error) {
      console.error("Error in deleteSearchArea:", error);
      toast.error("Errore nell'eliminare l'area di ricerca");
      return false;
    }
  };

  const clearAllSearchAreas = () => {
    console.log("Clearing all search areas");
    setSearchAreas([]);
    setActiveSearchArea(null);
    toast.success("Tutte le aree di ricerca sono state rimosse");
  };

  const editSearchArea = (id: string) => setActiveSearchArea(id);

  const toggleAddingSearchArea = () => {
    setIsAddingSearchArea(prev => !prev);
    if (!isAddingSearchArea) {
      const radius = calculateRadius();
      pendingRadiusRef.current = radius;
      toast.info(`Clicca sulla mappa per creare un'area di ricerca (raggio: ${(radius/1000).toFixed(1)}km)`);
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
    editSearchArea,
    generateSearchArea,
    toggleAddingSearchArea,
    // Export a method to set the pending radius
    setPendingRadius: (radius: number) => {
      pendingRadiusRef.current = radius;
    }
  };
}
