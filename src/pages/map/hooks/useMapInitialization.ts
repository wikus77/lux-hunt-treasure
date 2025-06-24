
import { useState, useRef, useCallback } from 'react';
import L from 'leaflet';

export const useMapInitialization = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const mapRef = useRef<L.Map | null>(null);
  const isMapInitialized = useRef(false);

  const handleMapLoad = useCallback((map: L.Map) => {
    if (map) {
      mapRef.current = map;
      isMapInitialized.current = true;
      setMapLoaded(true);
      setMapStatus('ready');
      console.log('🗺️ Map loaded and ready');
      
      // Single size invalidation after mount
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);
    }
  }, []);

  const handleMapReady = useCallback(() => {
    console.log('🗺️ Map ready event received');
    if (!isMapInitialized.current) {
      setMapLoaded(true);
      setMapStatus('ready');
      isMapInitialized.current = true;
    }
  }, []);

  return {
    mapLoaded,
    setMapLoaded,
    mapStatus,
    setMapStatus,
    mapRef,
    handleMapLoad,
    handleMapReady,
    isMapInitialized: isMapInitialized.current
  };
};
