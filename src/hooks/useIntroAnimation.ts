
import { useState, useEffect } from "react";

interface UseIntroAnimationReturn {
  showIntro: boolean;
  introCompleted: boolean;
  handleIntroComplete: () => void;
  renderError: Error | null;
}

export function useIntroAnimation(): UseIntroAnimationReturn {
  const [showIntro, setShowIntro] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(true); // Default a true
  const [renderError, setRenderError] = useState<Error | null>(null);
  
  useEffect(() => {
    // FALLBACK IMMEDIATO: mostra sempre il contenuto immediatamente
    // Settiamo introCompleted a true di default per saltare l'animazione
    console.log("FALLBACK FORZATO: Contenuto mostrato immediatamente");
    
    try {
      // In caso di problemi di rendering, garantisce che il contenuto sia visibile
      document.body.style.backgroundColor = "#000"; // Sfondo nero come fallback
      
      // Forza visualizzazione immediata del contenuto
      localStorage.setItem('introShown', 'true');
      setShowIntro(false);
      setIntroCompleted(true);
      
      // Forza visibilità del contenuto dopo un breve ritardo
      setTimeout(() => {
        const content = document.querySelector('.landing-content');
        if (content) {
          (content as HTMLElement).style.opacity = '1';
          (content as HTMLElement).style.display = 'block';
        }
      }, 100);
    } catch (error) {
      console.error("Errore nel controllo intro:", error);
      // In caso di errore, salta l'intro e mostra il contenuto
      setShowIntro(false);
      setIntroCompleted(true);
      setRenderError(error instanceof Error ? error : new Error(String(error)));
    }
  }, []);

  const handleIntroComplete = () => {
    console.log("Intro animation completed");
    setIntroCompleted(true);
    setShowIntro(false);
  };

  return {
    showIntro: false, // Sempre false per saltare l'intro
    introCompleted: true, // Sempre true per mostrare il contenuto
    handleIntroComplete,
    renderError
  };
}
