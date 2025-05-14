
import React, { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [dots, setDots] = useState("...");
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showFallbackInfo, setShowFallbackInfo] = useState(false);
  const [loadingDuration, setLoadingDuration] = useState(0);
  
  // MIGLIORAMENTO: Tracking tempo di caricamento
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setLoadingDuration(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // MIGLIORAMENTO: Crea un'animazione per i puntini di caricamento
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
    }, 8000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutInfo);
      clearTimeout(timeoutFallback);
    };
  }, []);
  
  // MIGLIORAMENTO: Aggiunto una funzione per forzare il ricaricamento
  const handleForceReload = () => {
    console.log("Forzatura ricaricamento pagina");
    window.location.reload();
  };
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
      <div className="loading-spinner text-center">
        <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4 text-xl">Caricamento{dots}</p>
        
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
    </div>
  );
};

export default LoadingScreen;
