
import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Circle, Plus } from "lucide-react";

interface MapInteractionControlsProps {
  handleAddMarker: () => void;
  handleAddArea: () => void;
  isAddingMarker: boolean;
  isAddingSearchArea: boolean;
}

const MapInteractionControls: React.FC<MapInteractionControlsProps> = ({
  handleAddMarker,
  handleAddArea,
  isAddingMarker,
  isAddingSearchArea
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button
        onClick={handleAddMarker}
        variant="outline"
        className="group"
        disabled={isAddingMarker}
      >
        <MapPin className="mr-2 h-4 w-4 text-[#39FF14] group-hover:animate-pulse" />
        Aggiungi punto
      </Button>
      
      <Button
        onClick={handleAddArea}
        variant="outline"
        className="group"
        disabled={isAddingSearchArea}
      >
        <Circle className="mr-2 h-4 w-4 text-[#9b87f5] group-hover:animate-pulse" />
        Inserisci area di ricerca
      </Button>
    </div>
  );
};

export default MapInteractionControls;
