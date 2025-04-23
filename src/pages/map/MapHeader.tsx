
import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Circle, Info, Zap } from "lucide-react";

type MapHeaderProps = {
  onAddMarker: () => void;
  onAddArea: () => void;
  onHelp: () => void;
  onBuzz: () => void;
  isAddingMarker: boolean;
  isAddingArea: boolean;
};

const MapHeader: React.FC<MapHeaderProps> = ({
  onAddMarker,
  onAddArea,
  onHelp,
  onBuzz,
  isAddingMarker,
  isAddingArea
}) => (
  <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onAddMarker}
        disabled={isAddingMarker || isAddingArea}
        className="flex gap-1 items-center"
      >
        <MapPin className="h-4 w-4" />
        <span className="hidden sm:inline">Aggiungi punto</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddArea}
        disabled={isAddingMarker || isAddingArea}
        className="flex gap-1 items-center"
      >
        <Circle className="h-4 w-4" />
        <span className="hidden sm:inline">Aggiungi area</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onHelp}
        className="bg-black/60 border border-white/10 hover:bg-black/80"
      >
        <Info className="h-4 w-4" />
      </Button>
    </div>
    <div className="flex items-center justify-center sm:justify-end">
      <button
        onClick={onBuzz}
        title="Buzz €5,99"
        className="
          rounded-full
          w-10 h-10
          flex justify-center items-center
          bg-gradient-to-tr from-[#4361ee] via-[#7209b7] to-[#00a3ff]
          shadow-[0_0_20px_2px_rgba(67,97,238,0.4)]
          hover:shadow-[0_0_32px_6px_rgba(67,97,238,0.60)]
          hover:scale-105
          transition-all
          border-2 border-[#4361ee]/70
          focus:outline-none
          ring-2 ring-[#00a3ff]/30
          active:scale-95
        "
      >
        <Zap className="h-5 w-5 text-white drop-shadow-lg" />
      </button>
    </div>
  </div>
);

export default MapHeader;
