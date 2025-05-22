
import React, { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';

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
      if (isAddingSearchArea) {
        console.log("MAP CLICKED", e.latlng);
        console.log("Coordinate selezionate:", e.latlng.lat, e.latlng.lng);
        
        // Pass the event to the click handler
        handleMapClickArea(e);
      }
    }
  });
  
  return null;
};

export default MapClickHandler;
