
import { useState, useEffect } from "react";
import IntroAnimationOptions from "@/components/intro/IntroAnimationOptions";

interface IntroManagerProps {
  pageLoaded: boolean;
  onIntroComplete: () => void;
}

const IntroManager = ({ pageLoaded, onIntroComplete }: IntroManagerProps) => {
  const [introCompleted, setIntroCompleted] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  
  // CORREZIONE: Verifica localStorage in modo sicuro
  useEffect(() => {
    try {
      // Solo lato client dopo montaggio del componente
      if (typeof window !== 'undefined') {
        // Force the intro to show every time for now (for testing)
        localStorage.removeItem("hasSeenIntro");
        setHasCheckedStorage(true);
        
        // Uncommenta questa parte per abilitare il salt dell'intro per gli utenti di ritorno
        // const hasSeenIntro = localStorage.getItem("hasSeenIntro");
        // if (hasSeenIntro === "true") {
        //   console.log("User has already seen the intro, skipping...");
        //   handleIntroComplete();
        // }
        // setHasCheckedStorage(true);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      // In caso di errore con localStorage, consideriamo come check eseguito
      setHasCheckedStorage(true);
    }
  }, []);
  
  useEffect(() => {
    if (!pageLoaded) {
      return;
    }
    
    // Prevent scrolling during intro
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [pageLoaded]);

  const handleIntroComplete = () => {
    setIntroCompleted(true);
    
    // Store that the user has seen the intro
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem("hasSeenIntro", "true");
      }
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
    
    // Restore scrolling
    document.body.style.overflow = "auto";
    
    // Notify parent component
    onIntroComplete();
  };
  
  // Se la pagina non è caricata o localStorage non è ancora controllato, mostra loading screen
  if (!pageLoaded || !hasCheckedStorage) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4">Caricamento in corso...</p>
        </div>
      </div>
    );
  }
  
  // Se intro non completata, mostra animazione intro selezionata
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
