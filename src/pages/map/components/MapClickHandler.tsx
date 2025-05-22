
import React, { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { v4 as uuidv4 } from 'uuid';

type MapClickHandlerProps = {
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
};

/**
 * Component dedicated to handling map click events
 */
const MapClickHandler: React.FC<MapClickHandlerProps> = ({
  isAddingSearchArea,
  handleMapClickArea
}) => {
  const map = useMapEvents({
    click: (e) => {
      console.log("MAP CLICKED", e.latlng);
      console.log("isAddingSearchArea state in click handler:", isAddingSearchArea);
      
      if (isAddingSearchArea) {
        console.log("Coordinate selezionate:", e.latlng.lat, e.latlng.lng);
        
        // Pass the event to the click handler
        handleMapClickArea(e);
      }
    }
  });
  
  // Add logging for component render with current state
  useEffect(() => {
    console.log("MapClickHandler rendered with isAddingSearchArea:", isAddingSearchArea);
  }, [isAddingSearchArea]);
  
  return null;
};

export default MapClickHandler;
