
import React, { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [dots, setDots] = useState("...");
  
  // Crea un'animazione per i puntini di caricamento
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "." : prev + ".");
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  console.log("LoadingScreen rendered");
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
      <div className="loading-spinner text-center">
        <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4 text-xl">Caricamento{dots}</p>
      </div>
      
      <div className="mt-12 text-cyan-400/70 text-sm">
        M1SSION sta caricando...
      </div>
    </div>
  );
};

export default LoadingScreen;
