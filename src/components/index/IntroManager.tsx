
import { useState, useEffect } from "react";
import LaserRevealIntro from "@/components/intro/LaserRevealIntro";

interface IntroManagerProps {
  pageLoaded: boolean;
  onIntroComplete: () => void;
}

const IntroManager = ({ pageLoaded, onIntroComplete }: IntroManagerProps) => {
  const [introCompleted, setIntroCompleted] = useState(false);
  
  // Check if intro should be skipped
  useEffect(() => {
    // Force the intro to show every time for now (for testing)
    // Comment the next line and uncomment the commented code below to enable skipping for returning users
    localStorage.removeItem("hasSeenIntro");
    
    // Uncomment this to enable skipping for returning users
    // const hasSeenIntro = localStorage.getItem("hasSeenIntro");
    // if (hasSeenIntro === "true") {
    //   console.log("User has already seen the intro, skipping...");
    //   handleIntroComplete();
    // }
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
    localStorage.setItem("hasSeenIntro", "true");
    
    // Restore scrolling
    document.body.style.overflow = "auto";
    
    // Notify parent component
    onIntroComplete();
  };
  
  const handleSkipIntro = () => {
    handleIntroComplete();
  };
  
  // If page not loaded yet, show loading screen
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
  
  // If intro not completed, show laser reveal animation
  if (!introCompleted) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        <LaserRevealIntro onComplete={handleIntroComplete} onSkip={handleSkipIntro} />
      </div>
    );
  }
  
  // If intro completed, return null (landing page will be shown)
  return null;
};

export default IntroManager;
