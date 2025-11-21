
import React from 'react';
import { Circle } from 'lucide-react';

interface SearchAreaButtonProps {
  toggleAddingSearchArea: () => void;
  isAddingSearchArea: boolean;
}

const SearchAreaButton: React.FC<SearchAreaButtonProps> = ({ toggleAddingSearchArea, isAddingSearchArea }) => {
  return (
    <button
      onClick={toggleAddingSearchArea}
      className={`absolute left-20 top-4 z-20 rounded-full w-10 h-10 flex items-center justify-center transition-all ${
        isAddingSearchArea
          ? 'bg-[#00f0ff]/80 hover:bg-[#00f0ff]/90'
          : 'bg-black/50 hover:bg-black/70'
      }`}
      title="Crea area di ricerca"
    >
      <Circle 
        className={`h-5 w-5 ${isAddingSearchArea ? 'text-white animate-pulse' : 'text-[#00f0ff]'}`} 
      />
    </button>
  );
};

export default SearchAreaButton;
