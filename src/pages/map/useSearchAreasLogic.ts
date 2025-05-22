
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { SearchArea } from "@/components/maps/types";
import { v4 as uuidv4 } from "uuid";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { analyzeCluesForLocation } from "@/utils/clueAnalyzer";
import { useNotifications } from "@/hooks/useNotifications";
import { clues } from "@/data/cluesData";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function useSearchAreasLogic(defaultLocation: [number, number]) {
  const [storageAreas, setStorageAreas] = useLocalStorage<SearchArea[]>("map-search-areas", []);
  const [searchAreas, setSearchAreas] = useState<SearchArea[]>(storageAreas || []);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const { unlockedClues } = useBuzzClues();
  const { notifications } = useNotifications();
  // Add a ref to store the radius temporarily while user selects map location
  const pendingRadiusRef = useRef<number>(500);

  // Sync areas with localStorage
  useEffect(() => {
    setStorageAreas(searchAreas);
    console.log("Updated search areas in localStorage:", searchAreas);
  }, [searchAreas, setStorageAreas]);

  const handleAddArea = (radius?: number) => {
    // Set the radius if provided
    if (radius) {
      pendingRadiusRef.current = radius;
      console.log("Setting pending radius to:", radius);
    }

    setIsAddingSearchArea(true);
    toast.info("Clicca sulla mappa per aggiungere una nuova area di ricerca", {
      description: `L'area sarà creata con il raggio di ${pendingRadiusRef.current} metri`
    });
  };

  const handleMapClickArea = (e: google.maps.MapMouseEvent) => {
    console.log("Map click event received:", e);
    console.log("isAddingSearchArea state:", isAddingSearchArea);

    if (isAddingSearchArea && e.latLng) {
      try {
        // Extract coordinates from the event
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const radius = pendingRadiusRef.current;
        
        console.log("Coordinates extracted: ", lat, lng);
        console.log("Using radius:", radius);
        
        // Create new search area object
        const newArea: SearchArea = {
          id: uuidv4(),
          lat, 
          lng,
          radius: radius,
          label: "Area di ricerca",
          color: "#00D1FF",
          position: { lat, lng }
        };
        
        console.log("Creating new search area:", newArea);

        // Update state with the new area
        setSearchAreas(prevAreas => {
          console.log("Previous areas:", prevAreas);
          const newAreas = [...prevAreas, newArea];
          console.log("Updated areas:", newAreas);
          return newAreas;
        });

        // Set the newly created area as active
        setActiveSearchArea(newArea.id);
        
        // Reset adding state
        setIsAddingSearchArea(false);
        
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
      
      console.log("Generated area:", newArea);
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

  const deleteSearchArea = (id: string) => {
    console.log("Deleting search area:", id);
    setSearchAreas(searchAreas.filter(area => area.id !== id));
    if (activeSearchArea === id) setActiveSearchArea(null);
    toast.success("Area di ricerca rimossa");
  };

  const clearAllSearchAreas = () => {
    console.log("Clearing all search areas");
    setSearchAreas([]);
    setActiveSearchArea(null);
    toast.success("Tutte le aree di ricerca sono state rimosse");
  };

  const editSearchArea = (id: string) => setActiveSearchArea(id);

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
    // Export a method to set the pending radius
    setPendingRadius: (radius: number) => {
      pendingRadiusRef.current = radius;
    }
  };
}
