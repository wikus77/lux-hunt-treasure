
import { useEffect, useState } from "react";

interface UseAnimationSequenceProps {
  onComplete: () => void;
  fallbackTime?: number;
}

const useAnimationSequence = ({ onComplete, fallbackTime = 2000 }: UseAnimationSequenceProps) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  // SUPER FALLBACK: Chiamare sempre onComplete dopo un breve periodo
  // Ridotto a 2 secondi per essere più veloce
  useEffect(() => {
    console.log("Inizializzazione sequence con fallback sicuro");
    const fallbackTimer = setTimeout(() => {
      console.log("FALLBACK SICUREZZA: forzatura completamento animazione");
      onComplete();
    }, fallbackTime);
    
    return () => clearTimeout(fallbackTimer);
  }, [onComplete, fallbackTime]);
  
  // Sequenza di animazione con gestione errori
  useEffect(() => {
    try {
      console.log("Avvio sequenza animazione");
      const timers = [
        // Fase 1: Pulsazione iniziale
        setTimeout(() => {
          console.log("Animazione: fase 1");
          setAnimationStage(1);
        }, 300),
        
        // Fase 2: L'occhio inizia ad aprirsi
        setTimeout(() => {
          console.log("Animazione: fase 2");
          setAnimationStage(2);
        }, 600),
        
        // Fase 3: Occhio completamente aperto, mostra logo
        setTimeout(() => {
          console.log("Animazione: fase 3");
          setAnimationStage(3);
        }, 1000),
        
        // Completa animazione
        setTimeout(() => {
          console.log("Animazione: completata");
          onComplete();
        }, 1800)
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    } catch (error) {
      console.error("Errore nella sequenza di animazione:", error);
      setHasError(true);
      onComplete(); // Chiama onComplete per non bloccare l'utente
    }
  }, [onComplete]);

  return { animationStage, hasError };
};

export default useAnimationSequence;
