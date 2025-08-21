
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
    <div 
      className="rounded-[20px] bg-[#1C1C1F] backdrop-blur-md transition-all duration-300 hover:shadow-lg mb-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1C1C1F 0%, rgba(28, 28, 31, 0.95) 50%, rgba(54, 94, 255, 0.1) 100%)',
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* Top gradient border */}
      <div 
        className="absolute top-0 left-0 w-full h-[1px]"
        style={{
          background: 'linear-gradient(90deg, #FC1EFF 0%, #365EFF 50%, #FACC15 100%)'
        }}
      />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white font-orbitron">
            Aree di interesse
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddClick}
            disabled={isAddingSearchArea}
            className="group bg-gradient-to-r from-[#365EFF] to-[#FC1EFF] text-white rounded-full border-none hover:shadow-lg transition-all"
          >
            <Plus className="mr-1 h-4 w-4" />
            Aggiungi Area
          </Button>
        </div>

        {searchAreas.length === 0 ? (
          <div className="p-4 border border-dashed border-gray-600 rounded-[16px] text-center text-gray-400">
            <p className="text-white/70">Nessuna area di interesse salvata</p>
            <p className="text-sm mt-1 text-white/50">Clicca su "Aggiungi Area" per iniziare</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {searchAreas.map((area) => (
              <div 
                key={area.id} 
                className="p-4 bg-[#0a0a0a]/50 rounded-[16px] transition-all hover:bg-[#0a0a0a]/70 cursor-pointer"
                onClick={() => {
                  console.log("🎯 SECTION CLICK: Area clicked in section:", area.id);
                  setActiveSearchArea(area.id);
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"/>
                      <h3 className="font-medium text-white text-lg font-orbitron">{area.label || 'Area di ricerca'}</h3>
                    </div>
                    <div className="text-xs text-white/50 mt-2 flex items-center">
                      <Circle className="h-3 w-3 mr-1 text-green-400" />
                      <span>Raggio: {(area.radius / 1000).toFixed(1)} km</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    {showConfirmDelete === area.id ? (
                      <>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(area.id, area.label || "Area di ricerca");
                          }}
                          className="rounded-full text-xs"
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
                          className="rounded-full text-xs"
                          disabled={isDeleting === area.id}
                        >
                          Annulla
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSearchArea(area.id);
                          }}
                          className="rounded-full text-green-400 border-green-500/50 hover:bg-green-950/30 text-xs"
                        >
                          Visualizza
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("🗑️ SECTION BUTTON: Delete button clicked in section for area:", area.id);
                            handleDeleteClick(area.id);
                          }}
                          className="rounded-full text-xs"
                          disabled={isDeleting !== null}
                        >
                          Elimina
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
};

export default SearchAreasSection;
