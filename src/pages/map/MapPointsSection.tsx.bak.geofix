
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Crosshair } from "lucide-react";
import { MapMarker } from '@/components/maps/types';
import { toast } from 'sonner';

interface MapPointsSectionProps {
  mapPoints: MapMarker[];
  isAddingMapPoint: boolean;
  toggleAddingMapPoint: () => void;
  setActiveMapPoint: (id: string | null) => void;
  deleteMapPoint: (id: string) => Promise<boolean>;
}

const MapPointsSection: React.FC<MapPointsSectionProps> = ({
  mapPoints,
  isAddingMapPoint,
  toggleAddingMapPoint,
  setActiveMapPoint,
  deleteMapPoint
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    console.log("🗑️ Delete button clicked for point:", id);
    setShowConfirmDelete(id);
  };

  const confirmDelete = async (id: string) => {
    console.log("✅ Confirming deletion for point:", id);
    setIsDeleting(id);
    
    try {
      const success = await deleteMapPoint(id);
      if (success) {
        console.log("✅ Point successfully deleted from database and UI");
        toast.success("Punto di interesse eliminato");
      } else {
        console.log("❌ Point deletion failed");
        toast.error("Errore durante l'eliminazione del punto");
      }
    } catch (error) {
      console.error("❌ Error deleting point:", error);
      toast.error("Errore durante l'eliminazione del punto");
    } finally {
      setIsDeleting(null);
      setShowConfirmDelete(null);
    }
  };

  const handleToggleAddPoint = () => {
    console.log("🔄 Toggling add point mode. Current state:", isAddingMapPoint);
    toggleAddingMapPoint();
    
    if (!isAddingMapPoint) {
      toast.info("Clicca sulla mappa per aggiungere un punto", {
        duration: 3000
      });
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
            Punti di interesse
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToggleAddPoint}
            className={`group bg-gradient-to-r from-[#365EFF] to-[#FC1EFF] text-white rounded-full border-none hover:shadow-lg transition-all ${isAddingMapPoint ? 'opacity-75' : ''}`}
          >
            {isAddingMapPoint ? (
              <Crosshair className="mr-1 h-4 w-4" />
            ) : (
              <Plus className="mr-1 h-4 w-4" />
            )}
            {isAddingMapPoint ? 'Annulla' : 'Aggiungi Punto'}
          </Button>
        </div>

        {mapPoints.length === 0 ? (
          <div className="p-4 border border-dashed border-gray-600 rounded-[16px] text-center text-gray-400">
            <p className="text-white/70">Nessun punto di interesse salvato</p>
            <p className="text-sm mt-1 text-white/50">Clicca su "Aggiungi Punto" per iniziare</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {mapPoints.map((point) => (
              <div 
                key={point.id} 
                className="p-4 bg-[#0a0a0a]/50 rounded-[16px] transition-all hover:bg-[#0a0a0a]/70"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-cyan-500"/>
                      <h3 className="font-medium text-white text-lg font-orbitron">{point.title || 'Punto senza titolo'}</h3>
                    </div>
                    {point.note && (
                      <p className="text-sm text-white/70 mt-2 line-clamp-2">{point.note}</p>
                    )}
                    <div className="text-xs text-white/50 mt-2 flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-cyan-400" />
                      <span>{point.lat.toFixed(6)}, {point.lng.toFixed(6)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    {showConfirmDelete === point.id ? (
                      <>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => confirmDelete(point.id)}
                          className="rounded-full text-xs"
                          disabled={isDeleting === point.id}
                        >
                          {isDeleting === point.id ? 'Eliminando...' : 'Conferma'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowConfirmDelete(null)}
                          className="rounded-full text-xs"
                          disabled={isDeleting === point.id}
                        >
                          Annulla
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setActiveMapPoint(point.id)}
                          className="rounded-full text-cyan-400 border-cyan-500/50 hover:bg-cyan-950/30 text-xs"
                        >
                          Visualizza
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteClick(point.id)}
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
    </div>
  );
};

export default MapPointsSection;
