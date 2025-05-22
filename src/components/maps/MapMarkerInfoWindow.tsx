
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, X, Check, MapPinX } from "lucide-react";
import { MapMarker } from "./types";

type Props = {
  marker: MapMarker;
  setActiveMarker: (id: string | null) => void;
  saveMarkerNote: (id: string, note: string) => void;
  editMarker: (id: string) => void;
  deleteMarker: (id: string) => void;
};

const MapMarkerInfoWindow: React.FC<Props> = ({
  marker,
  setActiveMarker,
  saveMarkerNote,
  editMarker,
  deleteMarker
}) => {
  const newNoteRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="min-w-[170px]">
      {marker.editing ? (
        <div className="flex flex-col gap-2">
          <Textarea
            ref={newNoteRef}
            defaultValue={marker.note}
            placeholder="Aggiungi una nota..."
            className="min-h-20"
          />
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (marker.note) {
                  editMarker(marker.id);
                  setActiveMarker(null);
                } else {
                  deleteMarker(marker.id);
                  setActiveMarker(null);
                }
              }}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                const note = newNoteRef.current?.value || "";
                saveMarkerNote(marker.id, note);
              }}
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="text-sm max-h-24 overflow-y-auto">
            {marker.note || "Nessuna nota"}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteMarker(marker.id)}
            >
              <MapPinX className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => editMarker(marker.id)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapMarkerInfoWindow;
