
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MapArea from "./MapArea";
import MapHeader from "./MapHeader";
import LoadingScreen from "./LoadingScreen";
import BuzzMapBanner from "@/components/buzz/BuzzMapBanner";
import { toast } from "@/components/ui/sonner";
import NotesSection from "./NotesSection";
import { MapMarker, SearchArea } from "@/components/maps/MapMarkers";
import { v4 as uuidv4 } from "uuid";

const MapLogicProvider = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [showCluePopup, setShowCluePopup] = useState(false);
  const [clueMessage, setClueMessage] = useState("");
  const location = useLocation();
  
  // Stato per i marker e le aree di ricerca
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [searchAreas, setSearchAreas] = useState<SearchArea[]>([]);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [activeSearchArea, setActiveSearchArea] = useState<string | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [isAddingSearchArea, setIsAddingSearchArea] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [buzzMapPrice] = useState<number>(1.99);
  
  useEffect(() => {
    // Timeout per simulare il caricamento
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Ottieni la posizione corrente dell'utente se possibile
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      (error) => {
        console.log("Errore nell'ottenere la posizione:", error.message);
      }
    );

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Verifica se c'è stato un completamento di pagamento tramite Buzz dalla mappa
    if (location.state?.paymentCompleted && location.state?.mapBuzz) {
      const clue = location.state?.clue;
      
      if (clue && clue.description) {
        setTimeout(() => {
          setClueMessage(clue.description);
          setShowCluePopup(true);
          
          // Solo se è esplicitamente richiesto di generare un'area sulla mappa
          if (location.state?.generateMapArea) {
            // Qui aggiungi la logica per generare l'area sulla mappa se necessario
            generateSearchArea();
            
            toast.success("Nuova area di ricerca generata!", {
              description: "Controlla la mappa per vedere la nuova area di ricerca."
            });
          }
        }, 1000);
      }
    }
  }, [location.state]);

  // Funzione per generare un'area di ricerca sulla mappa
  const generateSearchArea = () => {
    // Logica per generare un'area di ricerca
    console.log("Generazione area di ricerca sulla mappa");
    // Implementazione reale qui...
    
    if (currentLocation) {
      const newArea: SearchArea = {
        id: uuidv4(),
        lat: currentLocation[0],
        lng: currentLocation[1],
        radius: 500,
        label: "Area generata",
        color: "#4361ee"
      };
      
      setSearchAreas(prev => [...prev, newArea]);
      setActiveSearchArea(newArea.id);
    }
  };

  const handleMapReady = () => {
    setMapReady(true);
  };

  const handleCloseCluePopup = () => {
    setShowCluePopup(false);
  };
  
  // Gestore per l'aggiunta di punti sulla mappa
  const handleAddMarker = () => {
    setIsAddingMarker(true);
    setIsAddingSearchArea(false);
    toast.info("Clicca sulla mappa per aggiungere un nuovo punto");
  };
  
  // Gestore per l'aggiunta di aree sulla mappa
  const handleAddArea = () => {
    setIsAddingSearchArea(true);
    setIsAddingMarker(false);
    toast.info("Clicca sulla mappa per aggiungere una nuova area di ricerca");
  };
  
  // Gestisce il click sulla mappa
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (isAddingMarker && e.latLng) {
      const newMarker: MapMarker = {
        id: uuidv4(),
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        note: "",
        createdAt: new Date()
      };
      
      setMarkers(prev => [...prev, newMarker]);
      setActiveMarker(newMarker.id);
      setIsAddingMarker(false);
      toast.success("Punto aggiunto alla mappa");
    } else if (isAddingSearchArea && e.latLng) {
      const newArea: SearchArea = {
        id: uuidv4(),
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        radius: 500,
        label: "Area di ricerca",
        color: "#7209b7"
      };
      
      setSearchAreas(prev => [...prev, newArea]);
      setActiveSearchArea(newArea.id);
      setIsAddingSearchArea(false);
      toast.success("Area di ricerca aggiunta alla mappa");
    }
  };
  
  // Gestore per click doppio sulla mappa (zoom)
  const handleMapDoubleClick = (e: google.maps.MapMouseEvent) => {
    // Gestione del doppio click, se necessario
  };
  
  // Funzioni per la gestione di marker e aree
  const saveMarkerNote = (id: string, note: string) => {
    setMarkers(markers.map(marker => 
      marker.id === id ? { ...marker, note } : marker
    ));
  };
  
  const saveSearchArea = (id: string, label: string, radius: number) => {
    setSearchAreas(searchAreas.map(area => 
      area.id === id ? { ...area, label, radius } : area
    ));
  };
  
  const deleteMarker = (id: string) => {
    setMarkers(markers.filter(marker => marker.id !== id));
    if (activeMarker === id) setActiveMarker(null);
    toast.success("Punto rimosso dalla mappa");
  };
  
  const deleteSearchArea = (id: string) => {
    setSearchAreas(searchAreas.filter(area => area.id !== id));
    if (activeSearchArea === id) setActiveSearchArea(null);
    toast.success("Area di ricerca rimossa");
  };
  
  const editMarker = (id: string) => {
    setActiveMarker(id);
  };
  
  const editSearchArea = (id: string) => {
    setActiveSearchArea(id);
  };
  
  const clearAllMarkers = () => {
    setMarkers([]);
    setActiveMarker(null);
    toast.success("Tutti i punti sono stati rimossi");
  };
  
  // Funzione per il pulsante Buzz
  const handleBuzz = () => {
    toast.info(`Buzz Mappa: ${buzzMapPrice.toFixed(2)}€`, {
      description: "Funzionalità attualmente in sviluppo."
    });
  };
  
  // Mostra la schermata di aiuto
  const handleHelp = () => {
    toast.info("Guida Mappa", {
      description: "Utilizza i pulsanti in alto per aggiungere punti e aree di ricerca sulla mappa."
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative h-screen w-full p-4">
      <MapHeader 
        onAddMarker={handleAddMarker}
        onAddArea={handleAddArea}
        onHelp={handleHelp}
        onBuzz={handleBuzz}
        isAddingMarker={isAddingMarker}
        isAddingArea={isAddingSearchArea}
        buzzMapPrice={buzzMapPrice}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2">
          <MapArea 
            onMapReady={handleMapReady}
            markers={markers}
            searchAreas={searchAreas}
            isAddingMarker={isAddingMarker}
            isAddingSearchArea={isAddingSearchArea}
            activeMarker={activeMarker}
            activeSearchArea={activeSearchArea}
            onMapClick={handleMapClick}
            onMapDoubleClick={handleMapDoubleClick}
            setActiveMarker={setActiveMarker}
            setActiveSearchArea={setActiveSearchArea}
            saveMarkerNote={saveMarkerNote}
            saveSearchArea={saveSearchArea}
            editMarker={editMarker}
            editSearchArea={editSearchArea}
            deleteMarker={deleteMarker}
            deleteSearchArea={deleteSearchArea}
            currentLocation={currentLocation}
          />
        </div>
        
        <div className="col-span-1 bg-black/50 rounded-xl p-4 border border-projectx-deep-blue/40 shadow-xl">
          <NotesSection 
            markers={markers} 
            setActiveMarker={setActiveMarker} 
            clearAllMarkers={clearAllMarkers}
          />
        </div>
      </div>
      
      <BuzzMapBanner 
        open={showCluePopup && mapReady}
        message={clueMessage}
        area={null}
        onClose={handleCloseCluePopup} 
      />
    </div>
  );
};

export default MapLogicProvider;
