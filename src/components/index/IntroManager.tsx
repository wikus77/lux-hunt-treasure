
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
  
  // MIGLIORAMENTO: Verifica localStorage in modo sicuro con gestione errori
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
      setIntroCompleted(true);
      
      // Store that the user has seen the intro
      if (typeof window !== 'undefined') {
        localStorage.setItem("hasSeenIntro", "true");
      }
      
      // Restore scrolling
      document.body.style.overflow = "auto";
      
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
  
  // MIGLIORAMENTO: Rendering più sicuro dell'intro
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
