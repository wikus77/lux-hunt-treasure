// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import { useState, useEffect } from 'react';

export interface LocationData {
  lat: number;
  lng: number;
}

export function useLocation(): LocationData | null {
  const [location, setLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    };

    const onSuccess = (position: GeolocationPosition) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    };

    const onError = (error: GeolocationPositionError) => {
      console.warn('Location detection failed:', error.message);
    };

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return location;
}