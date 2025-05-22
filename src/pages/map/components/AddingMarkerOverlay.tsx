
import React from 'react';

interface AddingMarkerOverlayProps {
  isAddingMarker: boolean;
}

const AddingMarkerOverlay: React.FC<AddingMarkerOverlayProps> = ({ isAddingMarker }) => {
  if (!isAddingMarker) return null;
  
  return (
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30 pointer-events-none">
      <div className="bg-black/80 p-4 rounded-lg text-center max-w-md border border-[#00D1FF]/50 shadow-[0_0_15px_rgba(0,209,255,0.3)]">
        <p className="text-white font-medium">Clicca sulla mappa per posizionare il punto di interesse</p>
        <p className="text-sm text-gray-300 mt-1">Puoi aggiungere una nota dopo aver creato il punto</p>
      </div>
    </div>
  );
};

export default AddingMarkerOverlay;
