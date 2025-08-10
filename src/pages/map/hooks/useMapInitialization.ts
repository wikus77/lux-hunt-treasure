// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import { useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import { toast } from 'sonner';
const FALLBACK_MILAN = { lat: 45.4642, lng: 9.19 } as const;
let __mapFallbackWarned = false;

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
      const hasLatLng = e && (e as any).latlng && typeof (e as any).latlng.lat === 'number' && typeof (e as any).latlng.lng === 'number';
      const lat = hasLatLng ? (e as any).latlng.lat : FALLBACK_MILAN.lat;
      const lng = hasLatLng ? (e as any).latlng.lng : FALLBACK_MILAN.lng;
      if (!hasLatLng && !__mapFallbackWarned) { console.warn('geoloc unavailable – fallback Milano'); __mapFallbackWarned = true; }

      if (isAddingMapPoint || isAddingPoint) {
        hookHandleMapPointClick(lat, lng);
      } else if (isAddingSearchArea) {
        handleMapClickArea({ ...(e as any), latlng: { lat, lng } });
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
