
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
      // Force cursor style directly with multiple approaches
      map.getContainer().style.cursor = 'crosshair';
      // Also add class for extra enforcement
      map.getContainer().classList.add('crosshair-cursor-enabled');
      map.getContainer().classList.add('force-crosshair');
      console.log("CURSORE SETTATO A crosshair", isAddingSearchArea);
      toast.info("Clicca sulla mappa per posizionare l'area", {
        duration: 3000
      });
    } else {
      // Remove the crosshair cursor when not adding area
      map.getContainer().style.cursor = 'grab';
      map.getContainer().classList.remove('crosshair-cursor-enabled');
      map.getContainer().classList.remove('force-crosshair');
      console.log("CURSORE RIPRISTINATO A grab");
    }
    
    console.log("CURSORE ATTIVO:", map.getContainer().style.cursor);
    console.log("isAddingSearchArea:", isAddingSearchArea);
    
    return () => {
      if (map) {
        map.getContainer().style.cursor = 'grab';
        map.getContainer().classList.remove('crosshair-cursor-enabled');
        map.getContainer().classList.remove('force-crosshair');
      }
    };
  }, [isAddingSearchArea, map]);
}
