
import React, { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [dots, setDots] = useState("...");
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showFallbackInfo, setShowFallbackInfo] = useState(false);
  const [loadingDuration, setLoadingDuration] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Inizializzazione");
  
  // Tracking tempo di caricamento
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setLoadingDuration(elapsed);
      
      // Aggiornamento stadio caricamento in base al tempo trascorso
      if (elapsed > 2 && elapsed <= 5) {
        setLoadingStage("Caricamento componenti");
      } else if (elapsed > 5 && elapsed <= 8) {
        setLoadingStage("Inizializzazione interfaccia");
      } else if (elapsed > 8) {
        setLoadingStage("Finalizzazione");
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Animazione per i puntini di caricamento
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "." : prev + ".");
    }, 500);
    
    // Mostra info aggiuntive se il caricamento è lento
    const timeoutInfo = setTimeout(() => {
      setShowAdditionalInfo(true);
    }, 3000);
    
    // Mostra info fallback se il caricamento è molto lento
    const timeoutFallback = setTimeout(() => {
      setShowFallbackInfo(true);
    }, 7000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutInfo);
      clearTimeout(timeoutFallback);
    };
  }, []);
  
  // Funzione per forzare il ricaricamento
  const handleForceReload = () => {
    console.log("Forzatura ricaricamento pagina");
    // Aggiunta un parametro di query per evitare cache
    window.location.href = window.location.pathname + '?reload=' + Date.now();
  };
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
      <div className="loading-spinner text-center">
        <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4 text-xl">Caricamento{dots}</p>
        <p className="text-cyan-400/70 mt-1 text-sm">{loadingStage}</p>
        
        {loadingDuration > 5 && (
          <p className="text-yellow-400 mt-1 text-xs">
            Tempo di caricamento: {loadingDuration}s
          </p>
        )}
      </div>
      
      <div className="mt-12 text-cyan-400/70 text-sm">
        M1SSION sta caricando...
      </div>

      {showAdditionalInfo && (
        <div className="mt-4 text-gray-400 text-xs max-w-xs text-center">
          <p>Se questa pagina rimane visibile per molto tempo, prova ad aggiornare la pagina.</p>
        </div>
      )}
      
      {showFallbackInfo && (
        <div className="mt-6">
          <button 
            onClick={handleForceReload}
            className="px-4 py-2 bg-cyan-600/50 text-white rounded hover:bg-cyan-600/70 transition-all"
          >
            Ricarica Pagina
          </button>
        </div>
      )}

      {/* Visualizzazione evento di caricamento attuale */}
      {loadingDuration > 10 && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-900/30 rounded max-w-xs text-center">
          <p className="text-red-400 text-xs">
            Caricamento prolungato. È possibile che ci sia un problema con la connessione o con l'applicazione.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;
