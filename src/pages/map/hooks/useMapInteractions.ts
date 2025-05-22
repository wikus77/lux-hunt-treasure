
import { useCallback } from "react";
import { toast } from "sonner";

export const useMapInteractions = (
  markerLogic: { 
    isAddingMarker: boolean; 
    handleMapClickMarker: (e: google.maps.MapMouseEvent) => void; 
    setIsAddingMarker: (value: boolean) => void 
  },
  areaLogic: { 
    isAddingSearchArea: boolean; 
    handleMapClickArea: (e: google.maps.MapMouseEvent) => void; 
    setIsAddingSearchArea: (value: boolean) => void 
  }
) => {
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    try {
      if (markerLogic.isAddingMarker) {
        markerLogic.handleMapClickMarker(e);
        areaLogic.setIsAddingSearchArea(false);
      } else if (areaLogic.isAddingSearchArea) {
        areaLogic.handleMapClickArea(e);
        markerLogic.setIsAddingMarker(false);
      }
    } catch (error) {
      console.error("Errore nel gestire il click sulla mappa:", error);
      toast.error("Si è verificato un errore nel processare il click");
      markerLogic.setIsAddingMarker(false);
      areaLogic.setIsAddingSearchArea(false);
    }
  }, [markerLogic, areaLogic]);

  const handleMapDoubleClick = (_e: google.maps.MapMouseEvent) => { 
    // Currently a no-op as requested
  };

  const handleHelp = () => {
    toast.info("Guida Mappa", {
      description: "Utilizza i pulsanti in basso per aggiungere punti e aree di ricerca sulla mappa. Il Buzz Mappa ti aiuta a restringere l'area di ricerca basandosi sugli indizi disponibili."
    });
  };

  return {
    handleMapClick,
    handleMapDoubleClick,
    handleHelp
  };
};
