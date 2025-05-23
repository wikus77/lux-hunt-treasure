
import React from 'react';

interface MapInstructionsOverlayProps {
  isAddingSearchArea: boolean;
  isAddingMapPoint: boolean;
}

const MapInstructionsOverlay: React.FC<MapInstructionsOverlayProps> = ({
  isAddingSearchArea,
  isAddingMapPoint
}) => {
  if (!isAddingSearchArea && !isAddingMapPoint) return null;
  
  return (
    <>
      {/* Adding Area Instructions Overlay */}
      {isAddingSearchArea && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-black/80 p-4 rounded-lg text-center max-w-md border border-[#00D1FF]/50 shadow-[0_0_15px_rgba(0,209,255,0.3)]">
            <p className="text-white font-medium">Clicca sulla mappa per posizionare l'area di interesse</p>
            <p className="text-sm text-gray-300 mt-1">L'area verrà creata nel punto selezionato</p>
          </div>
        </div>
      )}

      {/* Adding Point Instructions Overlay */}
      {isAddingMapPoint && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-black/80 p-4 rounded-lg text-center max-w-md border border-[#39FF14]/50 shadow-[0_0_15px_rgba(57,255,20,0.3)]">
            <p className="text-white font-medium">Clicca sulla mappa per posizionare il punto di interesse</p>
            <p className="text-sm text-gray-300 mt-1">Potrai aggiungere un titolo e una nota dopo aver posizionato il punto</p>
          </div>
        </div>
      )}
    </>
  );
};

export default MapInstructionsOverlay;
