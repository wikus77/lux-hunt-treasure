
import React, { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { SearchArea } from '@/components/maps/types';
import { useCursorEffect } from '../hooks/useCursorEffect';
import { useMapBounds } from '../hooks/useMapBounds';
import MapClickHandler from './MapClickHandler';
import { useMapContext } from '../context/MapContext';

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
  const { mapRef, setMap } = useMapContext();
  
  // Store map reference in context
  useEffect(() => {
    if (map) {
      setMap(map);
    }
  }, [map, setMap]);
  
  // Log the isAddingSearchArea state
  useEffect(() => {
    console.log("MapEventHandlerComponent - isAddingSearchArea:", isAddingSearchArea);
    
    // Force cursor style
    if (map && isAddingSearchArea) {
      map.getContainer().style.cursor = 'crosshair';
      map.getContainer().classList.add('force-crosshair');
      map.getContainer().classList.add('crosshair-cursor-enabled');
      console.log("FORCING CROSSHAIR IN MAPEVENTHANDLER");
      console.log("🟢 Cursor set to crosshair in MapEventHandler");
      
      if (!isAddingSearchArea) {
        console.warn("FLAG isAddingSearchArea NON ATTIVO IN MAPEVENTHANDLER");
      }
    }
  }, [isAddingSearchArea, map]);
  
  // Use our custom hooks with map from context
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
