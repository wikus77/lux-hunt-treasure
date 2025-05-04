
import { useState, useEffect } from "react";

interface UseIntroAnimationReturn {
  showIntro: boolean;
  introCompleted: boolean;
  handleIntroComplete: () => void;
  renderError: Error | null;
}

export function useIntroAnimation(): UseIntroAnimationReturn {
  const [showIntro, setShowIntro] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [renderError, setRenderError] = useState<Error | null>(null);
  
  useEffect(() => {
    // FALLBACK IMMEDIATO: mostra sempre il contenuto dopo un breve ritardo
    // Ridotto a 800ms per essere più veloce e garantire che il contenuto sia visibile
    const forcedTimeout = setTimeout(() => {
      console.log("FALLBACK FORZATO ATTIVATO: Contenuto mostrato automaticamente");
      setIntroCompleted(true);
      setShowIntro(false);
    }, 800);
    
    try {
      // In caso di problemi di rendering, garantisce che il contenuto sia visibile
      document.body.style.backgroundColor = "#000"; // Sfondo nero come fallback
      
      const introShown = localStorage.getItem('introShown');
      
      if (introShown) {
        console.log("Intro già mostrato in precedenza, lo saltiamo");
        setShowIntro(false);
        setIntroCompleted(true);
      } else {
        // Prima visita, mostra intro ma con timeout di sicurezza
        console.log("Prima visita, mostriamo intro");
        setShowIntro(true);
        localStorage.setItem('introShown', 'true');
      }
    } catch (error) {
      console.error("Errore nel controllo intro:", error);
      // In caso di errore, salta l'intro e mostra il contenuto
      setShowIntro(false);
      setIntroCompleted(true);
      setRenderError(error instanceof Error ? error : new Error(String(error)));
    }
    
    return () => clearTimeout(forcedTimeout);
  }, []);

  const handleIntroComplete = () => {
    console.log("Intro animation completed");
    setIntroCompleted(true);
    setShowIntro(false);
  };

  return {
    showIntro,
    introCompleted,
    handleIntroComplete,
    renderError
  };
}
