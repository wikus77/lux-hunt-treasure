
import { useEffect, useState } from "react";

interface UseAnimationSequenceProps {
  onComplete: () => void;
  fallbackTime?: number;
}

const useAnimationSequence = ({ onComplete, fallbackTime = 1500 }: UseAnimationSequenceProps) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  // SUPER FALLBACK: Chiamare sempre onComplete dopo un periodo molto breve
  // Ulteriormente ridotto a 1.5 secondi per garantire visualizzazione
  useEffect(() => {
    console.log("Inizializzazione sequence con fallback immediato");
    const fallbackTimer = setTimeout(() => {
      console.log("FALLBACK IMMEDIATO: forzatura completamento animazione");
      onComplete();
    }, fallbackTime);
    
    return () => clearTimeout(fallbackTimer);
  }, [onComplete, fallbackTime]);
  
  // Sequenza di animazione molto semplificata con gestione errori
  useEffect(() => {
    try {
      console.log("Avvio sequenza animazione semplificata");
      
      // Fase 1: Passa subito alla fase 1
      setAnimationStage(1);
      
      // Dopo un breve periodo passa alla fase finale
      const timer = setTimeout(() => {
        console.log("Animazione: completata rapidamente");
        setAnimationStage(3);
        // Chiama onComplete per garantire che la landing sia visibile
        setTimeout(() => onComplete(), 300);
      }, 700);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Errore nella sequenza di animazione:", error);
      setHasError(true);
      // Chiamata immediata di onComplete in caso di errore
      onComplete();
      return undefined;
    }
  }, [onComplete]);

  return { animationStage, hasError };
};

export default useAnimationSequence;
