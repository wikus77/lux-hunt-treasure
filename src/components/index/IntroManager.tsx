
import { useState, useEffect } from "react";
import IntroAnimationOptions from "@/components/intro/IntroAnimationOptions";
import LoadingScreen from "@/components/index/LoadingScreen";

interface IntroManagerProps {
  pageLoaded: boolean;
  onIntroComplete: () => void;
}

const IntroManager = ({ pageLoaded, onIntroComplete }: IntroManagerProps) => {
  const [introCompleted, setIntroCompleted] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  
  // MIGLIORAMENTO: Previene blocchi se l'intro non completa in tempo ragionevole
  useEffect(() => {
    if (!introCompleted && pageLoaded) {
      // Timeout di sicurezza: se dopo 10 secondi l'intro non è ancora completato,
      // lo consideriamo completato forzatamente per evitare blocchi
      const id = window.setTimeout(() => {
        console.warn("⚠️ Intro timeout sicurezza attivato - Forzatura completamento");
        handleIntroComplete();
      }, 10000);
      
      setTimeoutId(id);
      
      return () => {
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }
  }, [introCompleted, pageLoaded]);
  
  // RIMOZIONE PERMANENTE: Non saltiamo mai l'intro
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Forza sempre la visualizzazione dell'intro
        try {
          localStorage.removeItem("hasSeenIntro");
          localStorage.removeItem("skipIntro");
        } catch (e) {
          console.warn("Non è stato possibile accedere a localStorage, ignoriamo:", e);
        }
        
        setHasCheckedStorage(true);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      setHasCheckedStorage(true);
      setError(error as Error);
    }
  }, []);
  
  // MIGLIORAMENTO: Gestione più robusta per prevenire scrolling durante intro
  useEffect(() => {
    if (!pageLoaded) {
      return;
    }
    
    try {
      // Prevent scrolling during intro
      document.body.style.overflow = "hidden";
      
      return () => {
        document.body.style.overflow = "auto";
      };
    } catch (error) {
      console.error("Error setting body overflow:", error);
    }
  }, [pageLoaded]);

  const handleIntroComplete = () => {
    try {
      // Cancelliamo il timeout di sicurezza se esiste
      if (timeoutId) window.clearTimeout(timeoutId);
      
      setIntroCompleted(true);
      
      // Store that the user has seen the intro
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem("hasSeenIntro", "true");
        } catch (e) {
          console.warn("Non è stato possibile salvare su localStorage, ignoriamo:", e);
        }
      }
      
      // Restore scrolling
      try {
        document.body.style.overflow = "auto";
      } catch (e) {
        console.warn("Errore nel ripristino dell'overflow, ignoriamo:", e);
      }
      
      // Notify parent component
      onIntroComplete();
    } catch (error) {
      console.error("Error in handleIntroComplete:", error);
      // Forziamo il completamento anche in caso di errore
      onIntroComplete();
    }
  };
  
  // In caso di errore, facciamo proseguire l'utente comunque
  if (error) {
    console.error("Error in IntroManager, skipping intro:", error);
    onIntroComplete();
    return null;
  }
  
  // MIGLIORAMENTO: Se la pagina non è caricata o localStorage non è ancora controllato, mostra loading screen
  if (!pageLoaded || !hasCheckedStorage) {
    return <LoadingScreen />;
  }
  
  // RIPRISTINO: Mostra sempre l'intro se non completata
  if (!introCompleted) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        <IntroAnimationOptions 
          onComplete={handleIntroComplete} 
          selectedOption={7} // Using LaserRevealIntro (ID: 7)
        />
      </div>
    );
  }
  
  // Se intro completata, return null (landing page sarà mostrata)
  return null;
};

export default IntroManager;
