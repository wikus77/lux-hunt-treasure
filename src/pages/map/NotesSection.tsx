
import React from 'react';
import { useMapLogic } from './useMapLogic';

const NotesSection = () => {
  const { markers, activeMarker, setActiveMarker, saveMarkerNote, deleteMarker, clearAllMarkers } = useMapLogic();
  
  return (
    <div>
      <h3 className="gradient-text-cyan text-lg font-semibold mb-3">Le tue note</h3>
      
      {markers.length === 0 ? (
        <p className="text-sm text-gray-400">Nessuna nota aggiunta. Aggiungi un punto sulla mappa per inserire una nota.</p>
      ) : (
        <>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 scrollbar-none">
            {markers.map((marker) => (
              <div
                key={marker.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  activeMarker === marker.id
                    ? "border-projectx-blue/70 bg-black/40 shadow-[0_0_10px_rgba(0,209,255,0.3)]"
                    : "border-white/10 bg-black/20 hover:bg-black/30"
                }`}
                onClick={() => setActiveMarker(marker.id === activeMarker ? null : marker.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm">
                    Punto {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Sei sicuro di voler eliminare questo punto?")) {
                        deleteMarker(marker.id);
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-400"
                  >
                    Elimina
                  </button>
                </div>
                
                {activeMarker === marker.id ? (
                  <div className="mt-2">
                    <textarea
                      className="w-full p-2 bg-black/40 border border-white/10 rounded text-sm text-white"
                      rows={3}
                      placeholder="Inserisci note per questo punto..."
                      value={marker.note || ""}
                      onChange={(e) => saveMarkerNote(marker.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 truncate">
                    {marker.note || "Nessuna nota"}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <button
              onClick={() => {
                if (window.confirm("Sei sicuro di voler eliminare tutti i punti sulla mappa?")) {
                  clearAllMarkers();
                }
              }}
              className="text-sm text-red-500 hover:text-red-400"
            >
              Cancella tutti i punti
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotesSection;
