
import React from 'react';

type AddingAreaInstructionsProps = {
  isAddingSearchArea: boolean;
};

const AddingAreaInstructions: React.FC<AddingAreaInstructionsProps> = ({ isAddingSearchArea }) => {
  if (!isAddingSearchArea) return null;
  
  return (
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30 pointer-events-none">
      <div className="bg-black/80 p-4 rounded-lg text-center max-w-md border border-[#00D1FF]/50 shadow-[0_0_15px_rgba(0,209,255,0.3)]">
        <p className="text-white font-medium">Clicca sulla mappa per posizionare l'area di interesse</p>
        <p className="text-sm text-gray-300 mt-1">L'area verrà creata nel punto selezionato</p>
      </div>
    </div>
  );
};

export default AddingAreaInstructions;
