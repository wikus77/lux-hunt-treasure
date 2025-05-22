
import { useEffect } from 'react';
import L from 'leaflet';
import { toast } from 'sonner';

/**
 * Custom hook to manage map cursor styles based on map actions
 */
export function useCursorEffect(
  map: L.Map | null,
  isAddingSearchArea: boolean
) {
  // Change cursor style based on the current action state
  useEffect(() => {
    if (!map) return;
    
    if (isAddingSearchArea) {
      // Use direct style setting for immediate effect
      map.getContainer().style.cursor = 'crosshair';
      console.log("CURSORE CAMBIATO A CROSSHAIR");
      toast.info("Clicca sulla mappa per posizionare l'area", {
        duration: 3000
      });
    } else {
      // Remove the crosshair cursor class when not adding area
      map.getContainer().style.cursor = 'grab';
      console.log("Cursore ripristinato a grab");
    }
    
    console.log("CURSORE ATTIVO:", map.getContainer().style.cursor);
    console.log("isAddingSearchArea:", isAddingSearchArea);
    
    return () => {
      if (map) {
        map.getContainer().style.cursor = 'grab';
      }
    };
  }, [isAddingSearchArea, map]);
}
