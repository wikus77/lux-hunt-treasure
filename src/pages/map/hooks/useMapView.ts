
import { useState, useEffect } from 'react';

export interface MapViewConfig {
  center: [number, number];
  zoom: number;
}

export const useMapView = () => {
  const [center, setCenter] = useState<[number, number]>([41.9028, 12.4964]); // Rome
  const [zoom, setZoom] = useState(6);

  // Try to get user location for better initial view
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter([latitude, longitude]);
          setZoom(10);
          console.log('🗺️ User location found:', latitude, longitude);
        },
        (error) => {
          console.log('🗺️ Could not get user location, using default (Rome)');
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes
        }
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
