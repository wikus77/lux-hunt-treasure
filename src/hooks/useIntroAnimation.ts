
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
    // Fallback timeout: always show content after a brief delay
    const forcedTimeout = setTimeout(() => {
      console.log("FALLBACK FORZATO: Attivazione visualizzazione contenuto");
      setIntroCompleted(true);
      setShowIntro(false);
    }, 1000); // Very short, 1 second
    
    try {
      const introShown = localStorage.getItem('introShown');
      
      if (introShown) {
        console.log("Intro già mostrato in precedenza, lo saltiamo");
        setShowIntro(false);
        setIntroCompleted(true);
      } else {
        // First visit, show intro
        console.log("Prima visita, mostriamo intro");
        setShowIntro(true);
        localStorage.setItem('introShown', 'true');
      }
    } catch (error) {
      console.error("Errore nel controllo intro:", error);
      // In case of error, skip intro and show content
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
