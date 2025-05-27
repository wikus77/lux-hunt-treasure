
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
    if (!map) return;
    
    console.log("🔄 MapController - State changed:", { isAddingPoint });
    
    // Change cursor style based on the current mode
    const mapContainer = map.getContainer();
    
    if (isAddingPoint) {
      mapContainer.style.cursor = 'crosshair';
      console.log("🎯 MapController - Cursor set to crosshair for point addition");
      toast.info("Clicca sulla mappa per posizionare il punto", { duration: 3000 });
    } else {
      mapContainer.style.cursor = 'grab';
      console.log("🎯 MapController - Cursor set to grab");
    }
    
    // Cleanup cursor on unmount
    return () => {
      mapContainer.style.cursor = 'grab';
    };
  }, [map, isAddingPoint]);
  
  return null;
};

export default MapController;
