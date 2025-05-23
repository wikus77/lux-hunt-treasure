
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { toast } from 'sonner';
import L from 'leaflet';

interface MapControllerProps {
  isAddingPoint: boolean;
  setIsAddingPoint: (value: boolean) => void;
  addNewPoint: (lat: number, lng: number) => void;
}

const MapController: React.FC<MapControllerProps> = ({ 
  isAddingPoint, 
  setIsAddingPoint, 
  addNewPoint 
}) => {
  const map = useMap();
  
  useEffect(() => {
    // Change cursor style based on the current mode
    const mapContainer = map.getContainer();
    
    if (isAddingPoint) {
      mapContainer.style.cursor = 'crosshair';
      toast.info("Clicca sulla mappa per posizionare il punto", { duration: 3000 });
    } else {
      mapContainer.style.cursor = 'grab';
    }
    
    // Add click handler to the map
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAddingPoint) {
        console.log("📍 Map clicked while in add point mode:", e.latlng);
        addNewPoint(e.latlng.lat, e.latlng.lng);
        setIsAddingPoint(false);
      }
    };

    map.on('click', handleMapClick);
    
    // Cleanup
    return () => {
      mapContainer.style.cursor = 'grab';
      map.off('click', handleMapClick);
    };
  }, [map, isAddingPoint, setIsAddingPoint, addNewPoint]);
  
  return null;
};

export default MapController;
