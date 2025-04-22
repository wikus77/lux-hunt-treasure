
import React, { useRef } from "react";
import { GoogleMap, Marker, InfoWindow, Circle } from "@react-google-maps/api";
import { MapPin, Pencil, X, Check, MapPinX, Circle as CircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  note: string;
  editing?: boolean;
};

export type SearchArea = {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  label: string;
  editing?: boolean;
};

type MapMarkersProps = {
  isLoaded: boolean;
  markers: MapMarker[];
  searchAreas: SearchArea[];
  isAddingMarker: boolean;
  isAddingSearchArea: boolean;
  activeMarker: string | null;
  activeSearchArea: string | null;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  onMapDoubleClick: (e: google.maps.MapMouseEvent) => void;
  setActiveMarker: (id: string | null) => void;
  setActiveSearchArea: (id: string | null) => void;
  saveMarkerNote: (id: string, note: string) => void;
  saveSearchArea: (id: string, label: string, radius: number) => void;
  editMarker: (id: string) => void;
  editSearchArea: (id: string) => void;
  deleteMarker: (id: string) => void;
  deleteSearchArea: (id: string) => void;
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
  searchAreas,
  isAddingMarker,
  isAddingSearchArea,
  activeMarker,
  activeSearchArea,
  onMapClick,
  onMapDoubleClick,
  setActiveMarker,
  setActiveSearchArea,
  saveMarkerNote,
  saveSearchArea,
  editMarker,
  editSearchArea,
  deleteMarker,
  deleteSearchArea,
}: MapMarkersProps) => {
  const newNoteRef = useRef<HTMLTextAreaElement>(null);
  const newLabelRef = useRef<HTMLInputElement>(null);
  const newRadiusRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full flex justify-center">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={center}
          onClick={onMapClick}
          onDblClick={onMapDoubleClick}
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
          {/* Search Areas */}
          {searchAreas.map(area => (
            <React.Fragment key={`area-${area.id}`}>
              <Circle 
                center={{ lat: area.lat, lng: area.lng }}
                radius={area.radius}
                options={{
                  fillColor: "#39FF144D",
                  fillOpacity: 0.2,
                  strokeColor: "#39FF14",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
                onClick={() => setActiveSearchArea(area.id)}
              />
              <Marker 
                position={{ lat: area.lat, lng: area.lng }}
                icon={{
                  path: "M10 10 L10 10 Z",
                  scale: 0,
                }}
                label={{
                  text: area.label,
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  className: "map-label"
                }}
                onClick={() => setActiveSearchArea(area.id)}
              />
            </React.Fragment>
          ))}

          {/* Markers */}
          {markers.map(marker => (
            <Marker 
              key={`marker-${marker.id}`}
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

          {/* Marker InfoWindows */}
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

          {/* Search Area InfoWindows */}
          {searchAreas.map(area => (
            activeSearchArea === area.id && (
              <InfoWindow
                key={`area-info-${area.id}`}
                position={{ lat: area.lat, lng: area.lng }}
                onCloseClick={() => setActiveSearchArea(null)}
              >
                <div className="min-w-[200px]">
                  {area.editing ? (
                    <div className="flex flex-col gap-2">
                      <div className="mb-2">
                        <label className="text-xs text-gray-500">Nome area</label>
                        <Input
                          ref={newLabelRef}
                          defaultValue={area.label}
                          placeholder="Nome area di ricerca"
                          className="text-sm"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="text-xs text-gray-500">Raggio (metri)</label>
                        <Input
                          ref={newRadiusRef}
                          type="number"
                          defaultValue={area.radius}
                          min={50}
                          max={5000}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            deleteSearchArea(area.id);
                            setActiveSearchArea(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            const label = newLabelRef.current?.value || "Area di ricerca";
                            const radius = Number(newRadiusRef.current?.value) || 500;
                            saveSearchArea(area.id, label, radius);
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div>
                        <h3 className="font-medium text-sm">{area.label}</h3>
                        <p className="text-xs text-gray-500">Raggio: {area.radius}m</p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSearchArea(area.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => editSearchArea(area.id)}
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
