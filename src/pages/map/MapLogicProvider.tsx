
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapArea from "./MapArea";
import MapHeader from "./MapHeader";
import LoadingScreen from "./LoadingScreen";
import BuzzMapBanner from "@/components/buzz/BuzzMapBanner";
import { toast } from "@/components/ui/sonner";

const MapLogicProvider = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [showCluePopup, setShowCluePopup] = useState(false);
  const [clueMessage, setClueMessage] = useState("");
  const [searchArea, setSearchArea] = useState<{
    lat: number;
    lng: number;
    radius: number;
    label: string;
    confidence?: string;
  } | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [searchAreas, setSearchAreas] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [activeSearchArea, setActiveSearchArea] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [buzzMapPrice, setBuzzMapPrice] = useState(1.99);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Timeout per simulare il caricamento
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

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
            // Qui aggiungi la logica per generare l'area sulla mappa
            generateRandomSearchArea();
            
            toast.success("Nuova area di ricerca generata!", {
              description: "Controlla la mappa per vedere la nuova area di ricerca."
            });
          }
        }, 1000);
      }
    }
  }, [location.state]);

  // Funzione per generare un'area di ricerca sulla mappa
  const generateRandomSearchArea = () => {
    // Genera coordinate casuali per un'area in Italia (approssimativa)
    const lat = 41.9 + (Math.random() - 0.5) * 6; // Area approssimativa dell'Italia
    const lng = 12.5 + (Math.random() - 0.5) * 8;
    const radius = 5000 + Math.random() * 50000; // Da 5 a 55 km
    
    const newArea = {
      lat,
      lng,
      radius,
      label: "Area di ricerca generata",
      confidence: Math.round(60 + Math.random() * 40) + "%", // 60-100%
    };
    
    setSearchArea(newArea);
    // Qui potresti anche aggiungere l'area a searchAreas se desideri accumularle
  };

  const handleMapReady = () => {
    setMapReady(true);
  };

  const handleCloseCluePopup = () => {
    setShowCluePopup(false);
    setSearchArea(null);
  };

  const handleAddMarker = () => {
    setIsAddingMarker(true);
    setIsAddingArea(false);
  };

  const handleAddArea = () => {
    setIsAddingMarker(false);
    setIsAddingArea(true);
  };

  const handleHelp = () => {
    // Implementare la logica di aiuto
    console.log("Mostrare l'aiuto");
  };

  const handleBuzz = () => {
    // Reindirizza alla pagina di pagamento con i parametri necessari
    navigate('/payment-methods', {
      state: { 
        fromBuzz: true,
        fromRegularBuzz: false,
        mapBuzz: true,
        generateMapArea: true
      }
    });
  };

  const handleMapClick = (e) => {
    // Gestire il click sulla mappa
  };

  const handleMapDoubleClick = (e) => {
    // Gestire il doppio click sulla mappa
  };

  const saveMarkerNote = (id, note) => {
    // Salvare la nota del marker
  };

  const saveSearchArea = (id, label, radius) => {
    // Salvare l'area di ricerca
  };

  const editMarker = (id) => {
    // Modificare il marker
  };

  const editSearchArea = (id) => {
    // Modificare l'area di ricerca
  };

  const deleteMarker = (id) => {
    // Eliminare il marker
  };

  const deleteSearchArea = (id) => {
    // Eliminare l'area di ricerca
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative h-screen w-full">
      <MapHeader 
        onAddMarker={handleAddMarker}
        onAddArea={handleAddArea}
        onHelp={handleHelp}
        onBuzz={handleBuzz}
        isAddingMarker={isAddingMarker}
        isAddingArea={isAddingArea}
        buzzMapPrice={buzzMapPrice}
      />
      <MapArea 
        onMapReady={handleMapReady}
        markers={markers}
        searchAreas={searchAreas}
        isAddingMarker={isAddingMarker}
        isAddingSearchArea={isAddingArea}
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
      <BuzzMapBanner 
        open={showCluePopup && mapReady} 
        area={searchArea}
        message={clueMessage} 
        onClose={handleCloseCluePopup} 
      />
    </div>
  );
};

export default MapLogicProvider;
