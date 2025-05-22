
import React, { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { SearchArea } from '@/components/maps/types';
import { useCursorEffect } from '../hooks/useCursorEffect';
import { useMapBounds } from '../hooks/useMapBounds';
import MapClickHandler from './MapClickHandler';

type MapEventHandlerProps = {
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  searchAreas: SearchArea[];
  setPendingRadius: (radius: number) => void;
};

const MapEventHandlerComponent: React.FC<MapEventHandlerProps> = ({
  isAddingSearchArea,
  handleMapClickArea,
  searchAreas,
  setPendingRadius
}) => {
  // Get the map instance from useMapEvents
  const map = useMapEvents({});
  
  // Use our custom hooks
  useCursorEffect(map, isAddingSearchArea);
  useMapBounds(map, searchAreas);
  
  // Debug: Log the search areas received by this component
  useEffect(() => {
    console.log("MapEventHandlerComponent received searchAreas:", searchAreas);
  }, [searchAreas]);
  
  return (
    <MapClickHandler 
      isAddingSearchArea={isAddingSearchArea}
      handleMapClickArea={handleMapClickArea}
    />
  );
};

export default MapEventHandlerComponent;
