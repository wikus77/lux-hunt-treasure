
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { SearchArea } from "@/components/maps/types";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import L from "leaflet";

/**
 * Hook providing operations for managing search areas
 */
export const useAreaOperations = () => {
  const [storageAreas, setStorageAreas] = useLocalStorage<SearchArea[]>("map-search-areas", []);
  const [searchAreas, setSearchAreas] = useState<SearchArea[]>(storageAreas || []);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  
  // Create a ref for map instead of using context
  const mapRef = useRef<L.Map | null>(null);
  
  // Ref to track state changes for debugging
  const isAddingRef = useRef(isAddingSearchArea);
  
  // Update ref when state changes
  useEffect(() => {
    isAddingRef.current = isAddingSearchArea;
    console.log("useAreaOperations - isAddingSearchArea UPDATED:", isAddingSearchArea, "ref:", isAddingRef.current);
  }, [isAddingSearchArea]);
  
  // Sync areas with localStorage whenever they change
  useEffect(() => {
    console.log("Setting storage areas:", searchAreas);
    setStorageAreas(searchAreas);
  }, [searchAreas, setStorageAreas]);

  // Log state changes for debugging
  useEffect(() => {
    console.log("useAreaOperations - isAddingSearchArea changed:", isAddingSearchArea);
  }, [isAddingSearchArea]);
  
  // Add a new area to the map based on coordinates
  const addArea = useCallback((lat: number, lng: number, radius: number) => {
    try {
      const newArea: SearchArea = {
        id: uuidv4(),
        lat, 
        lng,
        radius,
        label: "Area di ricerca",
        color: "#00D1FF",
        position: { lat, lng }
      };
      
      console.log("Area generata:", newArea);
      
      // Directly draw circle on the map
      if (mapRef.current) {
        const circle = L.circle([lat, lng], {
          radius: radius,
          color: '#00D1FF',
          fillColor: '#00D1FF',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(mapRef.current);
        
        console.log("✅ CERCHIO DISEGNATO DIRETTAMENTE IN addArea:", lat, lng);
      }
      
      setSearchAreas(prevAreas => {
        const newAreas = [...prevAreas, newArea];
        console.log("Updated search areas:", newAreas);
        return newAreas;
      });
      
      return newArea.id;
    } catch (error) {
      console.error("Errore nell'aggiunta dell'area:", error);
      toast.error("Si è verificato un errore nell'aggiunta dell'area");
      return null;
    }
  }, []);
  
  // Save (update) an existing area
  const saveSearchArea = useCallback((id: string, label: string, radius: number) => {
    console.log("Saving search area:", id, label, radius);
    setSearchAreas(prevAreas => {
      const updatedAreas = prevAreas.map(area =>
        area.id === id ? { ...area, label, radius } : area
      );
      return updatedAreas;
    });
    toast.success("Area di ricerca aggiornata");
  }, []);

  // Delete a search area
  const deleteSearchArea = useCallback((id: string) => {
    console.log("Deleting search area:", id);
    setSearchAreas(prevAreas => {
      const filteredAreas = prevAreas.filter(area => area.id !== id);
      return filteredAreas;
    });
    
    if (activeSearchArea === id) setActiveSearchArea(null);
    toast.success("Area di ricerca rimossa");
  }, [activeSearchArea]);

  // Clear all search areas
  const clearAllSearchAreas = useCallback(() => {
    console.log("Clearing all search areas");
    setSearchAreas([]);
    setActiveSearchArea(null);
    toast.success("Tutte le aree di ricerca sono state rimosse");
  }, []);

  // Start the process of adding an area - ensure this explicitly sets the state
  const startAddingArea = useCallback(() => {
    console.log("Starting area addition mode");
    setIsAddingSearchArea(true);
    console.log("🟢 FLAG isAddingSearchArea ATTIVATO");
    console.log("ATTIVATA MODALITÀ AGGIUNTA AREA");
    console.log("Modalità aggiunta area attivata, cursore cambiato in crosshair");
  }, []);
  
  // Stop the process of adding an area - ensure this explicitly sets the state
  const stopAddingArea = useCallback(() => {
    console.log("Stopping area addition mode");
    setIsAddingSearchArea(false);
    console.log("Modalità aggiunta area disattivata, cursore ripristinato");
  }, []);
  
  // Add an area with the given search area object
  const addSearchArea = useCallback((area: SearchArea) => {
    console.log("Adding search area:", area);
    
    // Directly draw circle on the map
    if (mapRef.current) {
      const circle = L.circle([area.lat, area.lng], {
        radius: area.radius,
        color: area.isAI ? '#9b87f5' : '#00D1FF',
        fillColor: area.isAI ? '#7E69AB' : '#00D1FF',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(mapRef.current);
      
      console.log("✅ CERCHIO DISEGNATO DIRETTAMENTE IN addSearchArea:", area.lat, area.lng);
    }
    
    setSearchAreas(prevAreas => {
      const newAreas = [...prevAreas, area];
      console.log("Updated search areas after adding:", newAreas);
      return newAreas;
    });
    return area.id;
  }, []);
  
  // Set map reference
  const setMap = useCallback((map: L.Map) => {
    console.log("Map instance set directly in useAreaOperations");
    mapRef.current = map;
  }, []);

  return {
    searchAreas,
    setSearchAreas,
    activeSearchArea,
    setActiveSearchArea,
    isAddingSearchArea,
    setIsAddingSearchArea,
    startAddingArea,
    stopAddingArea,
    addArea,
    addSearchArea,
    saveSearchArea,
    deleteSearchArea,
    clearAllSearchAreas,
    mapRef,
    setMap
  };
};
