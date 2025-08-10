// © 2025 All Rights Reserved  – M1SSION™  – NIYVORA KFT Joseph MULÉ
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { safeLatLng } from '@/pages/map/utils/safeLatLng';

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

  useEffect(() => {
    if (!map) return;

    const mapContainer = map.getContainer();

    mapContainer.style.cursor = isAddingMapPoint || isAddingSearchArea ? 'crosshair' : 'grab';
    return () => {
      mapContainer.style.cursor = 'grab';
    };
  }, [map, isAddingMapPoint, isAddingSearchArea]);

  useEffect(() => {
    if (!map) return;

    const CLICK_KEY = '__m1_click_bound__';

    const handleMapClick = (e: any) => {
      const ll = safeLatLng(e);
      if (!ll) return; // early exit, provider handles fallback separately

      if (isAddingSearchArea) {
        handleMapClickArea({ ...e, latlng: { lat: ll.lat, lng: ll.lng } });
      } else if (isAddingMapPoint) {
        onMapPointClick(ll.lat, ll.lng);
      }
    };

    // Prevent duplicate binding if another handler is mounted
    if ((map as any)[CLICK_KEY]) {
      if (import.meta.env.DEV) console.groupCollapsed('[MAP] click handler already bound');
      if (import.meta.env.DEV) console.groupEnd();
      return;
    }
    (map as any)[CLICK_KEY] = true;

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
      try { delete (map as any)[CLICK_KEY]; } catch {}
    };
  }, [map, isAddingSearchArea, isAddingMapPoint, handleMapClickArea, onMapPointClick]);

  return null;
};

export default MapEventHandler;
