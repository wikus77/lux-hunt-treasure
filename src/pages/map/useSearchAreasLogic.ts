
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SearchArea } from "@/components/maps/MapMarkers";
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

  // Sync areas with localStorage
  useEffect(() => {
    setStorageAreas(searchAreas);
  }, [searchAreas, setStorageAreas]);

  const handleAddArea = () => {
    setIsAddingSearchArea(true);
    toast.info("Clicca sulla mappa per aggiungere una nuova area di ricerca", {
      description: "Potrai personalizzare il nome e il raggio dell'area"
    });
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
        toast.success("Area di ricerca aggiunta alla mappa", {
          description: "Clicca sull'area per modificare il nome o il raggio"
        });
      } catch (error) {
        console.error("Errore nell'aggiunta dell'area:", error);
        setIsAddingSearchArea(false);
        toast.error("Si è verificato un errore durante l'aggiunta dell'area");
      }
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
    setSearchAreas(searchAreas.map(area =>
      area.id === id ? { ...area, label, radius } : area
    ));
    toast.success("Area di ricerca aggiornata");
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
  };
}
