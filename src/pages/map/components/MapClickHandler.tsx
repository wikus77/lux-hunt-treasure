
import React, { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useMapContext } from '../context/MapContext';

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
  const { mapRef, setMap } = useMapContext();
  
  const map = useMapEvents({
    click: (e) => {
      console.log("MAP CLICKED", e.latlng);
      console.log("isAddingSearchArea state in click handler:", isAddingSearchArea);
      
      if (isAddingSearchArea) {
        console.log("Coordinate selezionate:", e.latlng.lat, e.latlng.lng);
        
        // Force cursor style with highest priority
        if (map) {
          map.getContainer().style.cursor = 'crosshair';
          map.getContainer().classList.add('force-crosshair');
        }
        
        // Direct handling of click event
        handleMapClickArea(e);
      }
    }
  });
  
  // Store map reference in context
  useEffect(() => {
    if (map) {
      setMap(map);
      console.log("Map reference set in context from MapClickHandler");
    }
  }, [map, setMap]);
  
  // Add logging for component render with current state
  useEffect(() => {
    console.log("MapClickHandler rendered with isAddingSearchArea:", isAddingSearchArea);
    
    // Force cursor style on component mount/update if in adding mode
    if (map && isAddingSearchArea) {
      map.getContainer().style.cursor = 'crosshair';
      map.getContainer().classList.add('force-crosshair');
      map.getContainer().classList.add('crosshair-cursor-enabled');
      document.body.classList.add('map-adding-mode');
      console.log("FORCING CROSSHAIR IN MAPCLICKHANDLER MOUNT");
      console.log("🟢 Cursor set to crosshair in MapClickHandler");
    }

    // Clean up when unmounting or updating
    return () => {
      if (!isAddingSearchArea && map) {
        document.body.classList.remove('map-adding-mode');
      }
    };
  }, [isAddingSearchArea, map]);
  
  return null;
};

export default MapClickHandler;
