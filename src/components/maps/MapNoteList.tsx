
import React from "react";
import { MapPin, StickyNote } from "lucide-react";
import type { MapMarker } from "./MapMarkers";

type MapNoteListProps = {
  markers: MapMarker[];
  setActiveMarker: (id: string) => void;
};

export const MapNoteList = ({ markers, setActiveMarker }: MapNoteListProps) => (
  <div className="mt-6">
    <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-projectx-neon-blue">
      <StickyNote className="w-5 h-5" /> Note Salvate
    </h3>
    <div className="space-y-3">
      {markers.length === 0 ? (
        <div className="text-center py-4 text-gray-400">
          Nessuna nota aggiunta. Aggiungi un segnaposto sulla mappa per iniziare.
        </div>
      ) : (
        markers.map((marker) => (
          <div 
            key={`note-${marker.id}`}
            className="p-3 rounded-md bg-projectx-deep-blue/40 backdrop-blur-sm cursor-pointer"
            onClick={() => setActiveMarker(marker.id)}
          >
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 flex-shrink-0 text-lime-400" />
              <div className="flex-1 text-sm">
                {marker.note || <span className="text-gray-400 italic">Nessuna nota</span>}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
