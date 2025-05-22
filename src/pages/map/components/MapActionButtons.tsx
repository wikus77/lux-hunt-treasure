
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Circle as CircleIcon } from 'lucide-react';

interface MapActionButtonsProps {
  handleAddMarker: () => void;
  handleBuzz: () => void;
  buzzMapPrice: number;
}

const MapActionButtons: React.FC<MapActionButtonsProps> = ({
  handleAddMarker,
  handleBuzz,
  buzzMapPrice
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-4">
      <Button
        onClick={handleAddMarker}
        className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white shadow-[0_0_10px_rgba(0,209,255,0.5)] hover:shadow-[0_0_15px_rgba(0,209,255,0.7)]"
      >
        <MapPin className="mr-1 h-4 w-4" />
        Aggiungi punto
      </Button>
      
      <Button
        onClick={handleBuzz}
        className="bg-gradient-to-r from-projectx-blue to-projectx-pink text-white shadow-[0_0_10px_rgba(217,70,239,0.5)] hover:shadow-[0_0_15px_rgba(217,70,239,0.7)]"
      >
        <CircleIcon className="mr-1 h-4 w-4" />
        BUZZ {buzzMapPrice.toFixed(2)}€
      </Button>
    </div>
  );
};

export default MapActionButtons;
