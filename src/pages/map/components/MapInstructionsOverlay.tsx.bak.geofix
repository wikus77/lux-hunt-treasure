
import React from 'react';

interface MapInstructionsOverlayProps {
  isAddingMapPoint: boolean;
  isAddingSearchArea: boolean;
}

const MapInstructionsOverlay: React.FC<MapInstructionsOverlayProps> = ({
  isAddingMapPoint,
  isAddingSearchArea
}) => {
  if (!isAddingMapPoint && !isAddingSearchArea) return null;
  
  return (
    <div className="absolute top-16 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg border border-white/10 backdrop-blur-md">
        {isAddingMapPoint && (
          <p className="text-sm">
            <span className="text-cyan-400 font-medium">Clicca sulla mappa</span> per aggiungere un punto di interesse
          </p>
        )}
        
        {isAddingSearchArea && (
          <p className="text-sm">
            <span className="text-cyan-400 font-medium">Clicca sulla mappa</span> per creare un'area di ricerca
          </p>
        )}
      </div>
    </div>
  );
};

export default MapInstructionsOverlay;
