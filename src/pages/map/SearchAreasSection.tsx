
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Circle, Plus } from "lucide-react";
import { SearchArea } from "@/components/maps/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type SearchAreasSectionProps = {
  searchAreas: SearchArea[];
  setActiveSearchArea: (id: string | null) => void;
  clearAllSearchAreas: () => void;
  handleAddArea: (radius?: number) => void;
  isAddingSearchArea: boolean;
};

const SearchAreasSection: React.FC<SearchAreasSectionProps> = ({
  searchAreas,
  setActiveSearchArea,
  clearAllSearchAreas,
  handleAddArea,
  isAddingSearchArea
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [areaRadius, setAreaRadius] = useState("500");

  // Handle dialog state - close it if we're already adding an area
  useEffect(() => {
    if (isAddingSearchArea) {
      setIsDialogOpen(false);
    }
  }, [isAddingSearchArea]);

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmAddArea = () => {
    const radius = parseInt(areaRadius);
    if (isNaN(radius) || radius <= 0) {
      return;
    }
    
    setIsDialogOpen(false);
    console.log("Confirming area add with radius:", radius);
    // Pass the radius value to handleAddArea
    handleAddArea(radius);
    
    // Force log to confirm the action
    console.log("ATTIVATA MODALITÀ AGGIUNTA AREA dalla Dialog");
  };

  return (
    <>
      <div className="flex justify-between mt-6 mb-2">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Circle className="h-4 w-4 text-lime-400" />
          Aree di interesse
        </h2>
        <div className="flex gap-2">
          {searchAreas.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllSearchAreas}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              Cancella tutto
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddClick}
            disabled={isAddingSearchArea}
            className="text-xs flex items-center gap-1 bg-black/40 hover:bg-black/60 text-[#00D1FF] hover:text-[#33D9FF]"
          >
            <Plus className="h-3.5 w-3.5" />
            Aggiungi area
          </Button>
        </div>
      </div>
      <div className="space-y-3 mt-2">
        {searchAreas.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            Nessuna area di interesse. Aggiungi un'area sulla mappa per iniziare.
          </div>
        ) : (
          searchAreas.map((area) => (
            <div
              key={`area-list-${area.id}`}
              className={`p-3 rounded-[16px] backdrop-blur-sm cursor-pointer transition-colors
                ${area.isAI
                  ? "bg-[#7E69AB]/40 hover:bg-[#7E69AB]/60 border-l-4 border-[#9b87f5]"
                  : "bg-black/40 hover:bg-black/50"
                }`}
              onClick={() => setActiveSearchArea(area.id)}
            >
              <div className="flex items-start gap-2">
                <Circle className={`w-5 h-5 flex-shrink-0 ${area.isAI ? "text-[#9b87f5]" : "text-lime-400"}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{area.label}</div>
                  <div className="text-xs text-gray-400">Raggio: {area.radius/1000}km</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Area Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-black/80 backdrop-blur-md border border-white/10">
          <DialogHeader>
            <DialogTitle>Aggiungi area di interesse</DialogTitle>
            <DialogDescription>
              Definisci il raggio dell'area, poi seleziona un punto sulla mappa.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="radius" className="block text-sm font-medium text-gray-300 mb-1">
              Raggio in metri
            </label>
            <Input
              id="radius"
              type="number"
              min="100"
              max="10000"
              className="bg-black/60 border-white/20"
              value={areaRadius}
              onChange={(e) => setAreaRadius(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-2">
              Valore minimo: 100m, Valore massimo: 10000m
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-white/20 hover:bg-white/10"
            >
              Annulla
            </Button>
            <Button
              onClick={handleConfirmAddArea}
              className="bg-gradient-to-r from-[#00D1FF] to-[#9b87f5]"
            >
              Conferma e seleziona punto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchAreasSection;
