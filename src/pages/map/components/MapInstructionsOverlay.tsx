
import React from 'react';

interface MapInstructionsOverlayProps {
  isAddingSearchArea: boolean;
  isAddingMapPoint: boolean;
}

const MapInstructionsOverlay: React.FC<MapInstructionsOverlayProps> = ({ 
  isAddingSearchArea, 
  isAddingMapPoint 
}) => {
  if (!isAddingMapPoint && !isAddingSearchArea) return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-20 bg-black/70 text-white p-4 rounded-lg text-center">
      {isAddingMapPoint && <p>Clicca sulla mappa per posizionare un nuovo punto</p>}
      {isAddingSearchArea && <p>Clicca sulla mappa per definire un'area di ricerca</p>}
    </div>
  );
};

export default MapInstructionsOverlay;
