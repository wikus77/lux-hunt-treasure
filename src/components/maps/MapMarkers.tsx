
import React, { useRef } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin, Pencil, X, Check, MapPinX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  note: string;
  editing?: boolean;
};

type MapMarkersProps = {
  isLoaded: boolean;
  markers: MapMarker[];
  isAddingMarker: boolean;
  activeMarker: string | null;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  setActiveMarker: (id: string | null) => void;
  saveMarkerNote: (id: string, note: string) => void;
  editMarker: (id: string) => void;
  deleteMarker: (id: string) => void;
};

const mapContainerStyle = {
  width: "100%",
  height: "60vw",
  maxHeight: "60vh",
  minHeight: "300px",
  borderRadius: "1rem"
};

const center = { lat: 45.4642, lng: 9.19 }; // Milano

export const MapMarkers = ({
  isLoaded,
  markers,
  isAddingMarker,
  activeMarker,
  onMapClick,
  setActiveMarker,
  saveMarkerNote,
  editMarker,
  deleteMarker,
}: MapMarkersProps) => {
  const newNoteRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="relative w-full flex justify-center">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={center}
          onClick={onMapClick}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "auto",
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              }
            ]
          }}
        >
          {markers.map(marker => (
            <Marker 
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              icon={{
                path: "M16 21v-2a4 4 0 0 0-4-4h-0a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM18 18a6 6 0 1 0-12 0c0 3.5 4 6 6 6s6-2.5 6-6Z",
                fillColor: marker.note ? "#39FF14" : "#fff",
                fillOpacity: marker.note ? 0.7 : 0.3,
                strokeColor: marker.note ? "#39FF14" : "#222",
                strokeWeight: 2,
                scale: 0.9,
              }}
              onClick={() => setActiveMarker(marker.id)}
            />
          ))}
          {markers.map(marker => (
            activeMarker === marker.id && (
              <InfoWindow
                key={`info-${marker.id}`}
                position={{ lat: marker.lat, lng: marker.lng }}
                onCloseClick={() => setActiveMarker(null)}
              >
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
              </InfoWindow>
            )
          ))}
        </GoogleMap>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Caricamento mappa...
        </div>
      )}
    </div>
  );
};
