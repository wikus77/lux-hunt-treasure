
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
    
    console.log("Preparing intro animation...");
    document.body.style.overflow = "hidden"; // Prevent scrolling during intro
    
    // Add safety timeout to ensure intro completes even if animations fail
    const safetyTimeout = setTimeout(() => {
      if (showIntroOverlay && !introCompleted) {
        console.log("Safety timeout: forcing intro completion");
        handleIntroComplete();
      }
    }, 8000); // 8-second safety timeout
    
    return () => {
      clearTimeout(safetyTimeout);
      document.body.style.overflow = "auto"; // Ensure scrolling is re-enabled
    };
  }, [pageLoaded]);

  const handleIntroComplete = () => {
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
  
  // Skip intro if facing issues
  if (!pageLoaded) {
    return null;
  }
  
  // Render appropriate intro component based on state
  if (showIntroOverlay) {
    return <IntroOverlay onComplete={handleOverlayComplete} />;
  }
  
  if (!introCompleted) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        <LaserRevealIntro onComplete={handleIntroComplete} />
      </div>
    );
  }
  
  return null;
};

export default IntroManager;
