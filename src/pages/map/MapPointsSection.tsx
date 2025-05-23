
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Crosshair } from "lucide-react";
import { MapMarker } from '@/components/maps/types';

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

  const handleDeleteClick = (id: string) => {
    setShowConfirmDelete(id);
  };

  const confirmDelete = async (id: string) => {
    await deleteMapPoint(id);
    setShowConfirmDelete(null);
  };

  const handleToggleAddPoint = () => {
    console.log("Toggling add point mode. Current state:", isAddingMapPoint);
    toggleAddingMapPoint();
    
    // Force cursor update on all map containers immediately
    setTimeout(() => {
      const mapContainers = document.querySelectorAll('.leaflet-container');
      mapContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          container.style.cursor = isAddingMapPoint ? 'grab' : 'crosshair';
          console.log("Forced cursor style:", isAddingMapPoint ? 'grab' : 'crosshair');
        }
      });
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <MapPin className="h-4 w-4 text-cyan-400" />
          Punti di interesse
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleToggleAddPoint}
          className={`group bg-gradient-to-r from-projectx-blue to-projectx-pink text-white rounded-full ${isAddingMapPoint ? 'bg-green-700/20 border-green-500/50' : ''}`}
        >
          {isAddingMapPoint ? (
            <Crosshair className="mr-1 h-4 w-4 text-green-400" />
          ) : (
            <Plus className="mr-1 h-4 w-4" />
          )}
          {isAddingMapPoint ? 'Annulla' : 'Aggiungi Punto'}
        </Button>
      </div>

      {mapPoints.length === 0 ? (
        <div className="p-4 border border-dashed border-gray-600 rounded-[24px] text-center text-gray-400">
          <p>Nessun punto di interesse salvato</p>
          <p className="text-sm mt-1">Clicca su "Aggiungi Punto" per iniziare</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {mapPoints.map((point) => (
            <div 
              key={point.id} 
              className="p-4 bg-[#0b0b0b] border border-cyan-500/20 rounded-[24px] hover:border-cyan-500/40 transition-all"
              style={{boxShadow: '0 0 6px rgba(0, 255, 255, 0.15)'}}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-cyan-500 animate-pulse"/>
                    <h3 className="font-medium text-white text-lg">{point.title || 'Punto senza titolo'}</h3>
                  </div>
                  {point.note && (
                    <p className="text-sm text-gray-300 mt-2 line-clamp-2">{point.note}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-2 flex items-center">
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
                        className="rounded-full"
                      >
                        Conferma
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowConfirmDelete(null)}
                        className="rounded-full"
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
                        className="rounded-full text-cyan-400 border-cyan-500/50 hover:bg-cyan-950/30"
                      >
                        Visualizza
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteClick(point.id)}
                        className="rounded-full"
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
  );
};

export default MapPointsSection;
