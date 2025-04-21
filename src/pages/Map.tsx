
import React, { useState, useEffect } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapMarkers, MapMarker } from "@/components/maps/MapMarkers";
import { MapNoteList } from "@/components/maps/MapNoteList";

const GOOGLE_MAPS_API_KEY = "AIzaSyC5OMBj9T4Si7lQbVU7n3Vs5YsqhfgP8b8";

const Map = () => {
  const { toast } = useToast();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });

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

      <MapMarkers
        isLoaded={isLoaded}
        markers={markers}
        isAddingMarker={isAddingMarker}
        activeMarker={activeMarker}
        onMapClick={handleMapClick}
        setActiveMarker={setActiveMarker}
        saveMarkerNote={saveMarkerNote}
        editMarker={editMarker}
        deleteMarker={deleteMarker}
      />

      <MapNoteList
        markers={markers}
        setActiveMarker={id => setActiveMarker(id)}
      />
    </div>
  );
};

export default Map;
