
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Circle, Plus, Trash2, ChevronDown } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface BuzzAreasExpansibleProps {
  searchAreas: SearchArea[];
  setActiveSearchArea: (id: string | null) => void;
  handleAddArea: (radius?: number) => void;
  isAddingSearchArea: boolean;
  deleteSearchArea: (id: string) => Promise<boolean>;
}

const BuzzAreasExpansible: React.FC<BuzzAreasExpansibleProps> = ({
  searchAreas,
  setActiveSearchArea,
  handleAddArea,
  isAddingSearchArea,
  deleteSearchArea
}) => {
  const [isExpanded, setIsExpanded] = useState(searchAreas.length > 0);
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

  // Auto-expand when areas are present
  useEffect(() => {
    if (searchAreas.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [searchAreas.length]);

  // Mock data per l'esempio - in produzione verranno dai searchAreas
  const mockAreaData = {
    center: "45.4642, 9.1900",
    radius: "5.2",
    mode: "FORCED MODE + BACKEND VERIFIED",
    generation: "settimana 24 - giorno 2025-06-09"
  };

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
      <div className="w-full col-span-full">
        {/* Container principale identico a M1SSION CONSOLE */}
        <div className="bg-[#0e0e11] rounded-2xl border border-[#1a1a1f] overflow-hidden shadow-md">
          {/* Linea gradient superiore */}
          <div className="h-[1px] bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff]" />
          
          {/* Header cliccabile con controls */}
          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-left hover:bg-white/5 transition-colors rounded p-1 -m-1"
              >
                <h3 className="uppercase font-bold tracking-wider text-base text-white">
                  AREE DI INTERESSE ({searchAreas.length})
                </h3>
                <ChevronDown 
                  className={cn(
                    "w-4 h-4 text-white transition-transform duration-300",
                    isExpanded ? "rotate-180" : ""
                  )}
                />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddClick}
                disabled={isAddingSearchArea}
                className="text-xs flex items-center gap-1 bg-black/40 hover:bg-black/60 text-[#00D1FF] hover:text-[#33D9FF] border-[#1a1a1f]"
              >
                <Plus className="h-3.5 w-3.5" />
                Aggiungi area
              </Button>
            </div>

            {/* Contenuto espandibile */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {searchAreas.length > 0 ? (
                <div className="space-y-4">
                  {/* Area details */}
                  <div className="space-y-2 text-sm text-neutral-300 mb-4">
                    <div>
                      <span className="text-neutral-400">📌 Centro stimato:</span> {mockAreaData.center}
                    </div>
                    <div>
                      <span className="text-neutral-400">📏 Raggio:</span> {mockAreaData.radius} km
                    </div>
                    <div>
                      <span className="text-neutral-400">🌀 Modalità:</span> {mockAreaData.mode}
                    </div>
                    <div>
                      <span className="text-neutral-400">📅 Generazione:</span> {mockAreaData.generation}
                    </div>
                  </div>

                  {/* Areas list */}
                  <div className="space-y-3">
                    {searchAreas.map((area) => (
                      <div
                        key={`area-list-${area.id}`}
                        className="p-3 rounded-[16px] backdrop-blur-sm cursor-pointer transition-colors bg-black/40 hover:bg-black/50"
                        onClick={() => {
                          console.log("🎯 AREA CLICK: Area clicked:", area.id);
                          setActiveSearchArea(area.id);
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <Circle className="w-5 h-5 flex-shrink-0 text-cyan-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{area.label}</div>
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
                                  className="h-8 rounded-full text-xs border-[#1a1a1f]"
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
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-neutral-500">
                  <p className="text-sm">Nessuna area attiva</p>
                </div>
              )}
            </div>
          </div>
        </div>
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

export default BuzzAreasExpansible;
