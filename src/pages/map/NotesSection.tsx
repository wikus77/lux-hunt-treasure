
import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import MapNoteList from "@/components/maps/MapNoteList";
import { MapMarker } from "@/components/maps/MapMarkers";

type NotesSectionProps = {
  markers: MapMarker[];
  setActiveMarker: (id: string | null) => void;
  clearAllMarkers: () => void;
};

const NotesSection: React.FC<NotesSectionProps> = ({
  markers,
  setActiveMarker,
  clearAllMarkers
}) => (
  <>
    <div className="flex justify-between mt-4 mb-2">
      <h2 className="text-lg font-medium text-white flex items-center gap-2">
        <MapPin className="h-4 w-4 text-lime-400" />
        Le tue note
      </h2>
      {markers.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllMarkers}
          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          Cancella tutto
        </Button>
      )}
    </div>
    <MapNoteList markers={markers} setActiveMarker={setActiveMarker} />
  </>
);

export default NotesSection;
