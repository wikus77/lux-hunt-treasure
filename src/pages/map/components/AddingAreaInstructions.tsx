
import React from 'react';

interface AddingAreaInstructionsProps {
  isAddingSearchArea: boolean;
}

const AddingAreaInstructions: React.FC<AddingAreaInstructionsProps> = ({ isAddingSearchArea }) => {
  if (!isAddingSearchArea) return null;
  
  return (
    <div className="absolute bottom-10 left-0 right-0 z-50 mx-auto max-w-md bg-black/80 text-white p-4 rounded-lg border border-blue-400 shadow-lg">
      <h3 className="text-lg font-semibold mb-2">Aggiungi un'area di ricerca</h3>
      <p className="text-sm">
        Clicca sulla mappa per posizionare l'area di ricerca.
        Il cursore è impostato in modalità selezione.
      </p>
    </div>
  );
};

export default AddingAreaInstructions;
