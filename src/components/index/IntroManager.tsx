
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
  
  useEffect(() => {
    console.log("IntroManager effect running, pageLoaded:", pageLoaded);
    
    if (!pageLoaded) {
      console.log("Page not loaded yet, returning");
      return;
    }
    
    // Force showing the intro every time
    console.log("Preparing intro animation...");
    document.body.style.overflow = "hidden"; // Prevent scrolling during intro
    
    // For debugging purposes, add a safety timeout
    const safetyTimeout = setTimeout(() => {
      if (showIntroOverlay && !introCompleted) {
        console.log("Safety timeout: forcing intro completion");
        handleIntroComplete();
      }
    }, 10000); // 10 second safety timeout
    
    return () => {
      clearTimeout(safetyTimeout);
      document.body.style.overflow = "auto"; // Ensure scrolling is re-enabled
    };
  }, [pageLoaded]);

  const handleIntroComplete = () => {
    // Mark intro as shown
    localStorage.setItem('introShown', 'true');
    setIntroCompleted(true);
    console.log("Intro completed, showing landing page");
    
    // Restore scrolling
    document.body.style.overflow = "auto";
    
    // Notify parent component
    onIntroComplete();
  };

  const handleOverlayComplete = () => {
    console.log("Overlay complete callback fired");
    setShowIntroOverlay(false);
  };
  
  console.log("IntroManager rendering. State:", { showIntroOverlay, introCompleted, pageLoaded });
  
  // Render appropriate intro component based on state
  if (showIntroOverlay && pageLoaded) {
    return <IntroOverlay onComplete={handleOverlayComplete} />;
  }
  
  if (!introCompleted && pageLoaded) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        <LaserRevealIntro onComplete={handleIntroComplete} />
      </div>
    );
  }
  
  return null;
};

export default IntroManager;
