
import { useState, useEffect } from "react";
import GlitchIntro from "@/components/intro/GlitchIntro";

interface IntroManagerProps {
  pageLoaded: boolean;
  onIntroComplete: () => void;
}

const IntroManager = ({ pageLoaded, onIntroComplete }: IntroManagerProps) => {
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
    }, 4000); // Safety timeout
    
    return () => {
      clearTimeout(safetyTimeout);
      document.body.style.overflow = "auto"; // Ensure scrolling is re-enabled
    };
  }, [pageLoaded, introCompleted]);

  const handleIntroComplete = () => {
    setIntroCompleted(true);
    console.log("Intro completed, showing landing page");
    
    // Store that the user has seen the intro
    localStorage.setItem("hasSeenIntro", "true");
    
    // Restore scrolling
    document.body.style.overflow = "auto";
    
    // Notify parent component
    onIntroComplete();
  };

  const handleSkipIntro = () => {
    console.log("User skipped intro");
    handleIntroComplete();
  };
  
  console.log("IntroManager rendering. State:", { introCompleted, pageLoaded, introFailed });
  
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
  
  // Render the glitch intro if we haven't completed it yet
  if (!introCompleted) {
    return (
      <GlitchIntro onComplete={handleIntroComplete} onSkip={handleSkipIntro} />
    );
  }
  
  return null;
};

export default IntroManager;
