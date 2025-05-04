
import { useState, useEffect } from "react";

interface UseIntroAnimationReturn {
  showIntro: boolean;
  introCompleted: boolean;
  handleIntroComplete: () => void;
  renderError: Error | null;
}

export function useIntroAnimation(): UseIntroAnimationReturn {
  // Impostiamo tutti i valori su stato finale corretto per mostrare subito il contenuto
  const [showIntro] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(true);
  const [renderError, setRenderError] = useState<Error | null>(null);
  
  useEffect(() => {
    console.log("useIntroAnimation: forzatura visibilità contenuto");
    
    // Forza stili per rendere visibili i contenuti
    document.body.style.backgroundColor = "#000";
    document.body.style.display = "block";
    document.body.style.visibility = "visible";
    document.body.style.opacity = "1";
    
    try {
      // Forza visibilità del contenuto principale
      setTimeout(() => {
        const contentElements = document.querySelectorAll('.landing-content, .landing-content-wrapper');
        contentElements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.display = "block";
            element.style.visibility = "visible";
            element.style.opacity = "1";
          }
        });
        
        console.log("useIntroAnimation: forzatura visibilità elementi completata");
      }, 0);
    } catch (error) {
      console.error("Errore nella forzatura visibilità:", error);
      setRenderError(error instanceof Error ? error : new Error(String(error)));
    }
  }, []);

  const handleIntroComplete = () => {
    console.log("Intro completato (forzato)");
    setIntroCompleted(true);
  };

  return {
    showIntro: false, // Mai mostrare l'intro
    introCompleted: true, // Sempre considerare l'intro come completato
    handleIntroComplete,
    renderError
  };
}
