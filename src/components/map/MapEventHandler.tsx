// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
const FALLBACK_MILAN = { lat: 45.4642, lng: 9.19 } as const;
let __eventFallbackWarned = false;

interface MapEventHandlerProps {
  isAddingSearchArea: boolean;
  isAddingMapPoint: boolean;
  handleMapClickArea: (e: any) => void;
  searchAreas: any[];
  setPendingRadius: (radius: number) => void;
  onMapPointClick: (lat: number, lng: number) => void;
}

const MapEventHandler: React.FC<MapEventHandlerProps> = ({
  isAddingSearchArea,
  isAddingMapPoint,
  handleMapClickArea,
  searchAreas,
  setPendingRadius,
  onMapPointClick
}) => {
  const map = useMap();
  
  // Handle cursor style based on mode
  useEffect(() => {
    if (!map) return;
    
    const mapContainer = map.getContainer();
    
    if (isAddingMapPoint || isAddingSearchArea) {
      mapContainer.style.cursor = 'crosshair';
    } else {
      mapContainer.style.cursor = 'grab';
    }
    
    return () => {
      mapContainer.style.cursor = 'grab';
    };
  }, [map, isAddingMapPoint, isAddingSearchArea]);
  
  // Handle map click events
  useEffect(() => {
    if (!map) return;
    
    const handleMapClick = (e: any) => {
      const hasLatLng = e && e.latlng && typeof e.latlng.lat === 'number' && typeof e.latlng.lng === 'number';
      const lat = hasLatLng ? e.latlng.lat : FALLBACK_MILAN.lat;
      const lng = hasLatLng ? e.latlng.lng : FALLBACK_MILAN.lng;
      if (!hasLatLng && !__eventFallbackWarned) { console.warn('geoloc unavailable – fallback Milano'); __eventFallbackWarned = true; }

      if (isAddingSearchArea) {
        handleMapClickArea({ ...e, latlng: { lat, lng } });
      } else if (isAddingMapPoint) {
        onMapPointClick(lat, lng);
      }
    };
    
    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, isAddingSearchArea, isAddingMapPoint, handleMapClickArea, onMapPointClick]);
  
  return null;
};

export default MapEventHandler;
