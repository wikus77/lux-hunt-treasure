
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();

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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative h-screen w-full">
      <MapHeader />
      <MapArea onMapReady={handleMapReady} />
      <BuzzMapBanner 
        open={showCluePopup && mapReady} 
        message={clueMessage} 
        onClose={handleCloseCluePopup} 
      />
    </div>
  );
};

export default MapLogicProvider;
