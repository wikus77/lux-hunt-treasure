
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Circle, Plus, Trash2 } from "lucide-react";
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
import { toast } from 'sonner';

type SearchAreasSectionProps = {
  searchAreas: SearchArea[];
  setActiveSearchArea: (id: string | null) => void;
  handleAddArea: (radius?: number) => void;
  isAddingSearchArea: boolean;
  deleteSearchArea: (id: string) => Promise<boolean>;
};

const SearchAreasSection: React.FC<SearchAreasSectionProps> = ({
  searchAreas,
  setActiveSearchArea,
  handleAddArea,
  isAddingSearchArea,
  deleteSearchArea
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [areaRadius, setAreaRadius] = useState("500");
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Handle dialog state - close it if we're already adding an area
  useEffect(() => {
    if (isAddingSearchArea) {
      setIsDialogOpen(false);
    }
  }, [isAddingSearchArea]);

  // CRITICAL DEBUG: Log search areas changes
  useEffect(() => {
    console.log("📊 SECTION: SearchAreasSection - Areas updated:", {
      count: searchAreas.length,
      areas: searchAreas.map(area => ({
        id: area.id,
        label: area.label,
        radius: area.radius
      })),
      timestamp: new Date().toISOString()
    });
  }, [searchAreas]);

  const handleAddClick = () => {
    console.log("➕ ADD CLICK: Add area button clicked");
    setIsDialogOpen(true);
  };

  const handleConfirmAddArea = () => {
    const radius = parseInt(areaRadius);
    if (isNaN(radius) || radius <= 0) {
      console.log("❌ INVALID RADIUS: Invalid radius value:", areaRadius);
      return;
    }
    
    setIsDialogOpen(false);
    console.log("✅ CONFIRM ADD: Confirming area add with radius:", radius);
    handleAddArea(radius);
  };

  const handleDeleteClick = (areaId: string) => {
    console.log("🗑️ Delete button clicked for area:", areaId);
    setShowConfirmDelete(areaId);
  };

  const confirmDelete = async (areaId: string, areaLabel: string) => {
    console.log("✅ Confirming deletion for area:", areaId, areaLabel);
    setIsDeleting(areaId);
    
    try {
      const success = await deleteSearchArea(areaId);
      if (success) {
        console.log("✅ Area successfully deleted from database and UI");
        toast.success("Area di interesse eliminata");
      } else {
        console.log("❌ Area deletion failed");
        toast.error("Errore durante l'eliminazione dell'area");
      }
    } catch (error) {
      console.error("❌ Error deleting area:", error);
      toast.error("Errore durante l'eliminazione dell'area");
    } finally {
      setIsDeleting(null);
      setShowConfirmDelete(null);
    }
  };

  return (
    <>
      <div className="flex justify-between mt-6 mb-2">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Circle className="h-4 w-4 text-cyan-400" />
          Aree di interesse ({searchAreas.length})
        </h2>
        <div className="flex gap-2">
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
              className="p-3 rounded-[16px] backdrop-blur-sm cursor-pointer transition-colors bg-black/40 hover:bg-black/50"
              onClick={() => {
                console.log("🎯 SECTION CLICK: Area clicked in section:", area.id);
                setActiveSearchArea(area.id);
              }}
            >
              <div className="flex items-start gap-2">
                <Circle className="w-5 h-5 flex-shrink-0 text-cyan-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{area.label}</div>
                  <div className="text-xs text-gray-400">Raggio: {(area.radius/1000).toFixed(1)}km</div>
                </div>
                <div className="flex items-center gap-2">
                  {showConfirmDelete === area.id ? (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(area.id, area.label || "Area di ricerca");
                        }}
                        className="h-8 rounded-full text-xs"
                        disabled={isDeleting === area.id}
                      >
                        {isDeleting === area.id ? 'Eliminando...' : 'Conferma'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConfirmDelete(null);
                        }}
                        className="h-8 rounded-full text-xs"
                        disabled={isDeleting === area.id}
                      >
                        Annulla
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("🗑️ SECTION BUTTON: Delete button clicked in section for area:", area.id);
                        handleDeleteClick(area.id);
                      }}
                      className="h-8 w-8 p-0 rounded-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      disabled={isDeleting !== null}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Elimina area</span>
                    </Button>
                  )}
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
              max="100000"
              className="bg-black/60 border-white/20"
              value={areaRadius}
              onChange={(e) => setAreaRadius(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-2">
              Valore minimo: 100m, Valore massimo: 100000m
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
