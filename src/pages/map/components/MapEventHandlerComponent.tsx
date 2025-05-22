
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SearchArea } from '@/components/maps/types';
import MapClickHandler from './MapClickHandler';
import { useCursorEffect } from '../hooks/useCursorEffect';

type MapEventHandlerComponentProps = {
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  searchAreas: SearchArea[];
  setPendingRadius: (radius: number) => void;
};

const MapEventHandlerComponent: React.FC<MapEventHandlerComponentProps> = ({
  isAddingSearchArea,
  handleMapClickArea,
  searchAreas,
  setPendingRadius
}) => {
  // Create a reference to the map instance
  const mapRef = React.useRef<L.Map | null>(null);
  
  // Use cursor effect hook
  const map = useMap();
  useCursorEffect(map, isAddingSearchArea);
  
  // Log for debugging
  useEffect(() => {
    console.log("MapEventHandlerComponent rendered with isAddingSearchArea:", isAddingSearchArea);
    console.log("Current search areas:", searchAreas);
    
    // Set default radius
    setPendingRadius(500);
  }, [isAddingSearchArea, searchAreas, setPendingRadius]);
  
  return (
    <MapClickHandler 
      isAddingSearchArea={isAddingSearchArea} 
      handleMapClickArea={handleMapClickArea} 
      mapRef={mapRef}
    />
  );
};

export default MapEventHandlerComponent;
