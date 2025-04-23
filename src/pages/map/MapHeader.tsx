
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
  buzzMapPrice: number;
};

const MapHeader: React.FC<MapHeaderProps> = ({
  onAddMarker,
  onAddArea,
  onHelp,
  onBuzz,
  isAddingMarker,
  isAddingArea,
  buzzMapPrice
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
    <div className="flex items-center justify-center sm:justify-end gap-1">
      <div className="bg-gradient-to-tr from-[#1eaedb] via-[#9b87f5] to-[#d946ef] text-white text-sm px-4 py-1 rounded-full pointer-events-none select-none font-bold mr-2 tracking-wide shadow-lg border border-[#7209b7]/70">
        Buzz Mappa: {buzzMapPrice.toFixed(2)}€
      </div>
      <button
        onClick={onBuzz}
        title={`Buzz Mappa • ${buzzMapPrice.toFixed(2)}€`}
        className="
          rounded-full
          w-12 h-12
          flex justify-center items-center
          bg-gradient-to-tr from-[#1eaedb] via-[#7209b7] to-[#d946ef]
          shadow-[0_0_32px_8px_rgba(114,9,183,0.30)]
          hover:shadow-[0_0_52px_14px_rgba(114,9,183,0.50)]
          hover:scale-110
          transition-all
          border-2 border-[#9b87f5]/90
          focus:outline-none
          ring-2 ring-[#00a3ff]/30
          active:scale-95
        "
      >
        <Zap className="h-6 w-6 text-white drop-shadow-lg" />
      </button>
    </div>
  </div>
);

export default MapHeader;
