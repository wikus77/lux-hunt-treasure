
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
  };

  const handleMapReady = () => {
    setMapReady(true);
  };

  const handleCloseCluePopup = () => {
    setShowCluePopup(false);
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
        message={clueMessage} 
        onClose={handleCloseCluePopup} 
      />
    </div>
  );
};

export default MapLogicProvider;
