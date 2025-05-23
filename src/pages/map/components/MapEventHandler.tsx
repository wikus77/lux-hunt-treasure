
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

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
  
  // Handle map click events
  useEffect(() => {
    if (!map) return;
    
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAddingSearchArea) {
        handleMapClickArea(e);
      }
      // The main click handler for adding points is in MapController
    };
    
    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, isAddingSearchArea, isAddingMapPoint, handleMapClickArea, onMapPointClick]);
  
  return null;
};

export default MapEventHandler;
