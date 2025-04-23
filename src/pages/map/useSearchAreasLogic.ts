
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { SearchArea } from "@/components/maps/MapMarkers";
import { v4 as uuidv4 } from "uuid";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { analyzeCluesForLocation } from "@/utils/clueAnalyzer";
import { useNotifications } from "@/hooks/useNotifications";

export function useSearchAreasLogic(currentLocation: [number, number] | null) {
  const [searchAreas, setSearchAreas] = useState<SearchArea[]>([]);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const { unlockedClues } = useBuzzClues();
  const { notifications } = useNotifications();

  const handleAddArea = () => {
    setIsAddingSearchArea(true);
    toast.info("Clicca sulla mappa per aggiungere una nuova area di ricerca");
  };

  const handleMapClickArea = (e: google.maps.MapMouseEvent) => {
    if (isAddingSearchArea && e.latLng) {
      try {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const newArea: SearchArea = {
          id: uuidv4(),
          lat, lng,
          radius: 500,
          label: "Area di ricerca",
          color: "#7209b7",
          position: { lat, lng }
        };
        setSearchAreas(prev => [...prev, newArea]);
        setActiveSearchArea(newArea.id);
        setIsAddingSearchArea(false);
        toast.success("Area di ricerca aggiunta alla mappa");
      } catch (error) {
        console.error("Errore nell'aggiunta dell'area:", error);
        setIsAddingSearchArea(false);
        toast.error("Si è verificato un errore durante l'aggiunta dell'area");
      }
    }
  };

  // Calculate radius based on unlocked clues count (more clues = smaller radius = more precision)
  const calculateBuzzRadius = (): number => {
    // Base radius is 250km (250000m)
    // Minimum radius is 10km (10000m)
    if (unlockedClues <= 0) return 250000;
    
    // Linear interpolation between 250km and 10km based on clues count
    const maxRadius = 250000; // 250km in meters
    const minRadius = 10000;  // 10km in meters
    const maxClues = 1000;    // Max number of clues
    
    // Calculate the radius with inverse proportion to clue count
    // More clues = smaller radius = more precision
    const reduction = Math.min(unlockedClues, maxClues) / maxClues;
    const radius = maxRadius - (reduction * (maxRadius - minRadius));
    
    return Math.round(radius);
  };

  // Generate area from clue with dynamic radius
  const generateSearchArea = () => {
    try {
      // Use currentLocation as fallback if no clues provide location data
      let targetLat = currentLocation ? currentLocation[0] : 45.4642;
      let targetLng = currentLocation ? currentLocation[1] : 9.19;
      let label = "Area generata";
      let isAI = true;
      
      // Try to analyze clues for a more precise location if available
      const locationInfo = analyzeCluesForLocation([], notifications || []);
      
      if (locationInfo.lat && locationInfo.lng) {
        targetLat = locationInfo.lat;
        targetLng = locationInfo.lng;
        label = locationInfo.description || "Area basata su indizi";
      }

      // Calculate the radius based on the number of unlocked clues
      const radius = calculateBuzzRadius();

      // Create the search area with dynamic radius
      const newArea: SearchArea = {
        id: uuidv4(),
        lat: targetLat,
        lng: targetLng,
        radius: radius,
        label: label,
        color: "#4361ee",
        position: { lat: targetLat, lng: targetLng },
        isAI: isAI
      };
      
      setSearchAreas(prev => [...prev, newArea]);
      setActiveSearchArea(newArea.id);
      
      // Return the ID for the caller if needed
      return newArea.id;
    } catch (error) {
      console.error("Errore nella generazione dell'area:", error);
      toast.error("Impossibile generare l'area di ricerca");
      return null;
    }
  };

  const saveSearchArea = (id: string, label: string, radius: number) => {
    setSearchAreas(searchAreas.map(area =>
      area.id === id ? { ...area, label, radius } : area
    ));
  };

  const deleteSearchArea = (id: string) => {
    setSearchAreas(searchAreas.filter(area => area.id !== id));
    if (activeSearchArea === id) setActiveSearchArea(null);
    toast.success("Area di ricerca rimossa");
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
    editSearchArea,
    generateSearchArea,
    calculateBuzzRadius
  };
}
