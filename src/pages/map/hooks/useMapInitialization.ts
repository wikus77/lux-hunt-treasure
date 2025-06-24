
import { useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import { toast } from 'sonner';

export const useMapInitialization = (
  isAddingMapPoint: boolean,
  isAddingPoint: boolean,
  isAddingSearchArea: boolean,
  hookHandleMapPointClick: (lat: number, lng: number) => void,
  handleMapClickArea: (e: any) => void
) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  
  // Function to handle map load event
  const handleMapLoad = useCallback((map: L.Map) => {
    console.log("🗺️ Map component mounted and ready");
    
    if (!map) {
      console.log("❌ Map reference not available");
      return;
    }
    
    setMapLoaded(true);
    
    // Add direct click handler to the map as a fallback mechanism
    map.on('click', (e: L.LeafletMouseEvent) => {
      console.log("🔍 DIRECT MAP CLICK via mapRef", {
        isAdding: isAddingMapPoint || isAddingPoint,
        isAddingArea: isAddingSearchArea,
        latlng: e.latlng
      });
      
      // Only handle if in adding mode
      if (isAddingMapPoint || isAddingPoint) {
        console.log("✅ Processing direct map click for point");
        hookHandleMapPointClick(e.latlng.lat, e.latlng.lng);
      } else if (isAddingSearchArea) {
        console.log("✅ Processing direct map click for search area");
        handleMapClickArea(e);
      }
    });
    
    // Debug layer structure
    console.log("🔍 Leaflet map layers:", {
      panes: map.getPanes(),
      zoom: map.getZoom(),
      center: map.getCenter()
    });
  }, [isAddingMapPoint, isAddingPoint, isAddingSearchArea, hookHandleMapPointClick, handleMapClickArea]);

  return {
    mapLoaded,
    setMapLoaded,
    mapRef,
    handleMapLoad
  };
};
