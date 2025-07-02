
import { useState, useEffect } from 'react';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/utils/mapUtils';

export const useMapView = () => {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_MAP_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_MAP_ZOOM);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter([latitude, longitude]);
          setZoom(12);
        },
        (error) => {
          console.log('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  return {
    center,
    zoom,
    setCenter,
    setZoom
  };
};
