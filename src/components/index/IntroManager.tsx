
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
  
  // FORZATURA: Timeout di sicurezza per evitare blocchi
  useEffect(() => {
    if (!introCompleted && pageLoaded) {
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
  
  // FORZATURA ASSOLUTA: Mostra sempre l'intro, ignora localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Forza sempre la visualizzazione dell'intro - rimuovi ogni skip
        try {
          localStorage.removeItem("hasSeenIntro");
          localStorage.removeItem("skipIntro");
          localStorage.removeItem("introShown");
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
  
  // Previeni scrolling durante intro
  useEffect(() => {
    if (!pageLoaded) {
      return;
    }
    
    try {
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
      if (timeoutId) window.clearTimeout(timeoutId);
      
      setIntroCompleted(true);
      
      // Store che l'utente ha visto l'intro
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem("hasSeenIntro", "true");
        } catch (e) {
          console.warn("Non è stato possibile salvare su localStorage, ignoriamo:", e);
        }
      }
      
      // Ripristina scrolling
      try {
        document.body.style.overflow = "auto";
      } catch (e) {
        console.warn("Errore nel ripristino dell'overflow, ignoriamo:", e);
      }
      
      onIntroComplete();
    } catch (error) {
      console.error("Error in handleIntroComplete:", error);
      onIntroComplete();
    }
  };
  
  if (error) {
    console.error("Error in IntroManager, skipping intro:", error);
    onIntroComplete();
    return null;
  }
  
  // Mostra loading se pagina non caricata o localStorage non controllato
  if (!pageLoaded || !hasCheckedStorage) {
    return <LoadingScreen />;
  }
  
  // FORZATURA DISPLAY: Mostra sempre l'intro se non completata
  if (!introCompleted) {
    return (
      <div 
        className="fixed inset-0 z-[9999] bg-black"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          backgroundColor: '#000000'
        }}
      >
        <IntroAnimationOptions 
          onComplete={handleIntroComplete} 
          selectedOption={7} // LaserRevealIntro forzato
        />
      </div>
    );
  }
  
  return null;
};

export default IntroManager;
