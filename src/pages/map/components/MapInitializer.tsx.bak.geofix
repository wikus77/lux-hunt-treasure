
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapInitializerProps {
  onMapReady: (map: L.Map) => void;
}

const MapInitializer: React.FC<MapInitializerProps> = ({ onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    // Call the onMapReady callback with the map instance
    onMapReady(map);
  }, [map, onMapReady]);
  
  return null;
};

export default MapInitializer;
