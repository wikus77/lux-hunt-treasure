
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
      // Use L.DomUtil to add the crosshair cursor class
      L.DomUtil.addClass(map.getContainer(), 'crosshair-cursor-enabled');
      console.log("CURSORE CAMBIATO A CROSSHAIR");
      toast.info("Clicca sulla mappa per posizionare l'area", {
        duration: 3000
      });
    } else {
      // Remove the crosshair cursor class when not adding area
      L.DomUtil.removeClass(map.getContainer(), 'crosshair-cursor-enabled');
      map.getContainer().style.cursor = 'grab';
      console.log("Cursore ripristinato a grab");
    }
    
    return () => {
      if (map) {
        L.DomUtil.removeClass(map.getContainer(), 'crosshair-cursor-enabled');
        map.getContainer().style.cursor = 'grab';
      }
    };
  }, [isAddingSearchArea, map]);
}
