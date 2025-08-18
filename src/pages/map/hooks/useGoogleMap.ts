
import { useState, useCallback } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '@/config/apiKeys';
import { mapLibraries } from '../utils/mapStyles';

export const useGoogleMap = (initialZoom: number = 15) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: mapLibraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(null);

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    console.log("Google Maps component is mounted and ready");
  }, []);

  // Function to determine appropriate center for the map
  const getMapCenter = (userLocation: [number, number] | null) => {
    // If we have a specific map center state, use it
    if (mapCenter) {
      return mapCenter;
    }
    
    // If we have user location, use it
    if (userLocation && Array.isArray(userLocation) && userLocation.length === 2) {
      return { lat: userLocation[0], lng: userLocation[1] };
    }
    
    // Fall back to Roma
    return { lat: 41.9028, lng: 12.4964 };
  };

  // Function to update the map view
  const updateMapView = (location: [number, number], zoom?: number) => {
    if (map && Array.isArray(location) && location.length === 2) {
      const newCenter = { lat: location[0], lng: location[1] };
      map.panTo(newCenter);
      if (zoom) {
        map.setZoom(zoom);
      }
      setMapCenter(newCenter);
    }
  };

  return {
    map,
    setMap,
    mapZoom,
    setMapZoom,
    mapCenter,
    setMapCenter,
    isLoaded,
    loadError,
    onMapLoad,
    getMapCenter,
    updateMapView
  };
};
