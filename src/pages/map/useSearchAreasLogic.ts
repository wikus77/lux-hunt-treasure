
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { SearchArea } from "@/components/maps/MapMarkers";
import { v4 as uuidv4 } from "uuid";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { analyzeCluesForLocation } from "@/utils/clueAnalyzer";
import { useNotifications } from "@/hooks/useNotifications";
import { clues } from "@/data/cluesData";

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
    return 500000; // 500km fissi come richiesto
  };

  // Generate area from clue with dynamic radius
  const generateSearchArea = () => {
    try {
      // Utilizza l'analizzatore di indizi per determinare la posizione
      const locationInfo = analyzeCluesForLocation(clues, notifications || []);
      
      let targetLat = 42.5047; // Default al centro dell'Italia
      let targetLng = 12.5679;
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

      // Il raggio è fisso a 500km come richiesto dall'utente
      const radius = calculateBuzzRadius();

      // Crea l'area di ricerca
      const newArea: SearchArea = {
        id: uuidv4(),
        lat: targetLat,
        lng: targetLng,
        radius: radius,
        label: label,
        color: "#4361ee",
        position: { lat: targetLat, lng: targetLng },
        isAI: true,
        confidence: confidenceValue
      };
      
      setSearchAreas(prev => [...prev, newArea]);
      setActiveSearchArea(newArea.id);
      
      // Log dei dettagli per debug
      console.log("Area generata:", {
        posizione: `${targetLat}, ${targetLng}`,
        label,
        confidence: confidenceValue,
        radius: radius / 1000 + " km"
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
