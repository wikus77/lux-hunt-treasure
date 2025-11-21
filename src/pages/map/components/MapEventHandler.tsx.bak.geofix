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

  // Handle cursor style based on mode
  useEffect(() => {
    if (!map) return;

    const mapContainer = map.getContainer();

    if (isAddingMapPoint || isAddingSearchArea) {
      mapContainer.style.cursor = 'crosshair';
      if (import.meta.env.DEV) console.log(`🎯 Cursor changed to crosshair (Adding ${isAddingMapPoint ? 'point' : 'search area'})`);
    } else {
      mapContainer.style.cursor = 'grab';
      if (import.meta.env.DEV) console.log('🎯 Cursor changed to grab (normal mode)');
    }

    return () => {
      mapContainer.style.cursor = 'grab';
    };
  }, [map, isAddingMapPoint, isAddingSearchArea]);

  // Handle map click events (safe)
  useEffect(() => {
    if (!map) return;

    const CLICK_KEY = '__m1_click_bound__';

    const handleMapClick = (e: any) => {
      const ll = safeLatLng(e);
      if (import.meta.env.DEV) {
        console.groupCollapsed('🗺️ Map click');
        console.log({ isAddingMapPoint, isAddingSearchArea, latlng: ll });
        console.groupEnd();
      }

      if (isAddingSearchArea) {
        if (!ll) return; // early exit
        handleMapClickArea({ ...e, latlng: { lat: ll.lat, lng: ll.lng } });
      } else if (isAddingMapPoint) {
        if (!ll) return; // early exit
        onMapPointClick(ll.lat, ll.lng);
      } else {
        // ignore in normal mode
      }
    };

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
      if (import.meta.env.DEV) console.log('🗑️ Map click listener removed');
    };
  }, [map, isAddingSearchArea, isAddingMapPoint, handleMapClickArea, onMapPointClick]);

  return null;
};

export default MapEventHandler;
