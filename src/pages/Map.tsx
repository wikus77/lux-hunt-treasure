
import React from "react";
import { MapPin, StickyNote } from "lucide-react";
import { MapNoteList } from "@/components/maps/MapNoteList";
import InteractiveGlobe from "@/components/maps/InteractiveGlobe";

const Map = () => {
  return (
    <div className="pb-20 min-h-screen bg-black w-full p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-projectx-neon-blue">Mappa Interattiva</h2>
      </div>

      <div className="w-full h-[50vh] rounded-lg overflow-hidden border border-projectx-deep-blue glass-card mb-4 relative">
        <InteractiveGlobe />
      </div>

      <MapNoteList
        markers={[]}
        setActiveMarker={() => {}}
      />
    </div>
  );
};

export default Map;
