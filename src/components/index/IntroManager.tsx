
import { useState, useEffect } from "react";
import IntroOverlay from "@/components/intro/IntroOverlay";
import LaserRevealIntro from "@/components/intro/LaserRevealIntro";

interface IntroManagerProps {
  pageLoaded: boolean;
  onIntroComplete: () => void;
}

const IntroManager = ({ pageLoaded, onIntroComplete }: IntroManagerProps) => {
  const [showIntroOverlay, setShowIntroOverlay] = useState(true);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [introFailed, setIntroFailed] = useState(false);
  
  // Determina se l'intro deve essere saltata (in base a localStorage)
  useEffect(() => {
    // Verifica se l'utente ha già visto l'intro
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");
    if (hasSeenIntro === "true") {
      console.log("Utente ha già visto l'intro, saltando...");
      handleIntroComplete();
    }
  }, []);
  
  useEffect(() => {
    console.log("IntroManager effect running, pageLoaded:", pageLoaded);
    
    if (!pageLoaded) {
      console.log("Page not loaded yet, returning");
      return;
    }
    
    console.log("Preparing intro animation...");
    document.body.style.overflow = "hidden"; // Prevent scrolling during intro
    
    // Add safety timeout to ensure intro completes even if animations fail
    const safetyTimeout = setTimeout(() => {
      if (!introCompleted) {
        console.log("Safety timeout: forcing intro completion");
        setIntroFailed(true);
        handleIntroComplete();
      }
    }, 6000); // Reduced from 8s to 6s safety timeout
    
    return () => {
      clearTimeout(safetyTimeout);
      document.body.style.overflow = "auto"; // Ensure scrolling is re-enabled
    };
  }, [pageLoaded, introCompleted]);

  const handleIntroComplete = () => {
    setIntroCompleted(true);
    setShowIntroOverlay(false);
    console.log("Intro completed, showing landing page");
    
    // Store that the user has seen the intro
    localStorage.setItem("hasSeenIntro", "true");
    
    // Restore scrolling
    document.body.style.overflow = "auto";
    
    // Notify parent component
    onIntroComplete();
  };

  const handleOverlayComplete = () => {
    console.log("Overlay complete callback fired");
    setShowIntroOverlay(false);
  };
  
  const handleSkipIntro = () => {
    console.log("User skipped intro");
    handleIntroComplete();
  };
  
  console.log("IntroManager rendering. State:", { showIntroOverlay, introCompleted, pageLoaded, introFailed });
  
  // Skip intro if facing issues or page not loaded
  if (!pageLoaded) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4">Caricamento in corso...</p>
        </div>
      </div>
    );
  }
  
  // Se l'intro ha avuto problemi, skippiamo direttamente
  if (introFailed) {
    return null;
  }
  
  // Render appropriate intro component based on state
  if (showIntroOverlay) {
    return <IntroOverlay onComplete={handleOverlayComplete} onSkip={handleSkipIntro} />;
  }
  
  if (!introCompleted) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        <LaserRevealIntro onComplete={handleIntroComplete} onSkip={handleSkipIntro} />
      </div>
    );
  }
  
  return null;
};

export default IntroManager;
