
import React, { useState, useRef, useEffect } from "react";
import { MapPin, Pencil, X, Check, MapPinX, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type MapMarker = {
  id: string;
  x: number;
  y: number;
  note: string;
  editing?: boolean;
};

const Map = () => {
  const { toast } = useToast();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const newNoteRef = useRef<HTMLTextAreaElement>(null);

  // Carica i marker salvati al caricamento
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

  // Salva i marker quando cambiano
  useEffect(() => {
    localStorage.setItem('huntMap_markers', JSON.stringify(markers));
  }, [markers]);

  // Gestisce il clic sulla mappa per aggiungere un marker
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingMarker || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newMarker: MapMarker = {
      id: Date.now().toString(),
      x,
      y,
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
    
    // Focus sulla textarea dopo un breve ritardo
    setTimeout(() => {
      newNoteRef.current?.focus();
    }, 100);
  };

  // Salva la nota per un marker
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

  // Avvia la modifica di un marker
  const editMarker = (id: string) => {
    setMarkers(markers.map(marker => 
      marker.id === id ? { ...marker, editing: true } : marker
    ));
    setActiveMarker(id);
    
    // Focus sulla textarea dopo un breve ritardo
    setTimeout(() => {
      newNoteRef.current?.focus();
    }, 100);
  };

  // Elimina un marker
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
          Tocca un punto sulla mappa per aggiungere un segnaposto
        </div>
      )}
      
      {/* Mappa interattiva */}
      <div 
        ref={mapRef}
        onClick={handleMapClick}
        className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 
          ${isAddingMarker ? 'border-projectx-neon-blue cursor-crosshair' : 'border-projectx-deep-blue'} 
          bg-projectx-deep-blue/20 backdrop-blur-sm`}
        style={{
          backgroundImage: "url('https://img.freepik.com/free-vector/abstract-city-map-with-pins-navigation-app_23-2148097544.jpg?w=740&t=st=1718842840~exp=1718843440~hmac=30ecddaa075a70b3afa95a0c66c1a97a85a5dafad77b8398c9642ab8debc9d7e')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Markers sulla mappa */}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform 
              ${activeMarker === marker.id ? 'scale-125' : 'scale-100'}
              ${activeMarker === marker.id ? 'z-20' : 'z-10'}`}
            style={{ 
              left: `${marker.x}%`, 
              top: `${marker.y}%`,
            }}
          >
            <div 
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMarker(activeMarker === marker.id ? null : marker.id);
              }}
            >
              <MapPin 
                className={`w-8 h-8 drop-shadow-glow transition-colors duration-300 ${marker.note ? 'text-lime-400' : 'text-white'}`}
                color={marker.note ? "#39FF14" : "#fff"}
                strokeWidth={2.5}
                fill={marker.note ? "rgba(57, 255, 20, 0.3)" : "transparent"}
              />
              <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity duration-200">
                {marker.note ? marker.note.substring(0, 15) + (marker.note.length > 15 ? '...' : '') : 'Nessuna nota'}
              </div>
            </div>
            
            {/* Pannello nota */}
            {activeMarker === marker.id && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-56 bg-black/90 backdrop-blur-md border border-projectx-deep-blue rounded-md shadow-xl p-3 z-30 transition-all duration-300">
                {marker.editing ? (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      ref={newNoteRef}
                      defaultValue={marker.note}
                      placeholder="Aggiungi una nota..."
                      className="min-h-24 bg-projectx-deep-blue/50 border-projectx-deep-blue"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (marker.note) {
                            // Se c'è già una nota, annulla modifica
                            setMarkers(markers.map(m => 
                              m.id === marker.id ? { ...m, editing: false } : m
                            ));
                          } else {
                            // Se è un nuovo punto senza nota, elimina
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
                        onClick={(e) => {
                          e.stopPropagation();
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
                    <div className="text-sm max-h-32 overflow-y-auto">
                      {marker.note || "Nessuna nota"}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMarker(marker.id);
                        }}
                      >
                        <MapPinX className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          editMarker(marker.id);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
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
                onClick={() => {
                  setActiveMarker(marker.id);
                }}
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
