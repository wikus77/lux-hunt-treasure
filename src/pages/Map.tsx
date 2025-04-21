
import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin, Pencil, X, Check, MapPinX, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  note: string;
  editing?: boolean;
};

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE"; // Sostituisci con la tua API Key

const mapContainerStyle = {
  width: "100%",
  height: "60vw",
  maxHeight: "60vh",
  minHeight: "300px",
  borderRadius: "1rem"
};

const center = { lat: 45.4642, lng: 9.19 }; // Milano come centro mappa

const Map = () => {
  const { toast } = useToast();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const newNoteRef = useRef<HTMLTextAreaElement>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    const savedMarkers = localStorage.getItem('huntMap_markers');
    if (savedMarkers) {
      try {
        setMarkers(JSON.parse(savedMarkers));
      } catch (e) {
        console.error("Errore nel parsing dei marker salvati:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('huntMap_markers', JSON.stringify(markers));
  }, [markers]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!isAddingMarker || !e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newMarker: MapMarker = {
      id: Date.now().toString(),
      lat,
      lng,
      note: "",
      editing: true
    };
    setMarkers([...markers, newMarker]);
    setActiveMarker(newMarker.id);
    setIsAddingMarker(false);
    toast({
      title: "Segnaposto aggiunto",
      description: "Aggiungi una nota per questo punto sulla mappa",
    });
    setTimeout(() => {
      newNoteRef.current?.focus();
    }, 100);
  };

  const saveMarkerNote = (id: string, note: string) => {
    setMarkers(markers.map(marker => 
      marker.id === id ? { ...marker, note, editing: false } : marker
    ));
    setActiveMarker(null);
    toast({
      title: "Nota salvata",
      description: "La tua nota è stata salvata con successo",
    });
  };

  const editMarker = (id: string) => {
    setMarkers(markers.map(marker => 
      marker.id === id ? { ...marker, editing: true } : marker
    ));
    setActiveMarker(id);
    setTimeout(() => {
      newNoteRef.current?.focus();
    }, 100);
  };

  const deleteMarker = (id: string) => {
    setMarkers(markers.filter(marker => marker.id !== id));
    setActiveMarker(null);
    toast({
      title: "Segnaposto eliminato",
      description: "Il segnaposto è stato rimosso dalla mappa",
    });
  };

  return (
    <div className="pb-20 min-h-screen bg-black w-full p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-projectx-neon-blue">Mappa Interattiva</h2>
        <Button
          onClick={() => setIsAddingMarker(!isAddingMarker)}
          variant={isAddingMarker ? "destructive" : "default"}
          className="gap-2"
          size="sm"
        >
          {isAddingMarker ? (
            <>
              <X className="w-4 h-4" /> Annulla
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" /> Aggiungi Punto
            </>
          )}
        </Button>
      </div>
      {isAddingMarker && (
        <div className="rounded-md bg-projectx-deep-blue/40 backdrop-blur-sm p-2 mb-4 text-sm text-center">
          Clicca sulla mappa per aggiungere un segnaposto
        </div>
      )}

      <div className="relative w-full flex justify-center">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={13}
            center={center}
            onClick={handleMapClick}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              gestureHandling: "auto",
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
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
                                setMarkers(markers.map(m => 
                                  m.id === marker.id ? { ...m, editing: false } : m
                                ));
                              } else {
                                deleteMarker(marker.id);
                              }
                              setActiveMarker(null);
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

      {/* Lista di note sotto la mappa */}
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
    </div>
  );
};

export default Map;
