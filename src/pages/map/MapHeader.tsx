
import { PlusCircle, Filter, Map, HelpCircle, Zap } from "lucide-react";
import { MapFilters } from "@/components/maps/MapFilters";
import { toast } from "@/components/ui/sonner";

interface MapHeaderProps {
  onAddMarker: () => void;
  onAddArea: () => void;
  onHelp: () => void;
  onBuzz: () => void;
  isAddingMarker: boolean;
  isAddingArea: boolean;
  buzzMapPrice: number;
}

const MapHeader = ({
  onAddMarker,
  onAddArea,
  onHelp,
  onBuzz,
  isAddingMarker,
  isAddingArea,
  buzzMapPrice,
}: MapHeaderProps) => {
  // Handle filter changes
  const handleFilterChange = (filters: any) => {
    console.log("Filters changed:", filters);
    toast({
      title: "Filtri applicati",
      description: `Hai aggiornato i filtri della mappa`,
      duration: 3000,
    });
  };

  return (
    <div className="sticky top-16 z-10 w-full bg-black/50 backdrop-blur-sm py-3 px-4 border-b border-projectx-deep-blue/30">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onAddMarker}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-sm ${
              isAddingMarker
                ? "bg-projectx-blue text-white"
                : "bg-black/40 border border-projectx-deep-blue/40 hover:bg-black/60 press-effect"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Punto</span>
          </button>

          <button
            onClick={onAddArea}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-sm ${
              isAddingArea
                ? "bg-projectx-blue text-white"
                : "bg-black/40 border border-projectx-deep-blue/40 hover:bg-black/60 press-effect"
            }`}
          >
            <Map className="h-4 w-4" />
            <span>Area</span>
          </button>

          <MapFilters onFilterChange={handleFilterChange} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onHelp}
            className="bg-black/40 border border-projectx-deep-blue/40 py-1.5 px-3 rounded-md flex items-center gap-1.5 hover:bg-black/60 text-sm press-effect"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Aiuto</span>
          </button>

          <button
            onClick={onBuzz}
            className="bg-gradient-to-r from-projectx-blue to-projectx-pink py-1.5 px-3 rounded-md flex items-center gap-1.5 hover:opacity-90 text-sm press-effect"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Buzz Mappa</span>
            <span className="border-l border-white/20 pl-2 ml-1">{buzzMapPrice.toFixed(2)}€</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapHeader;
