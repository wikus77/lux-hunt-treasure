
import { useState, useEffect, useRef } from "react";
import IntroOverlay from "@/components/intro/IntroOverlay";
import LaserRevealIntro from "@/components/intro/LaserRevealIntro";

interface IntroManagerProps {
  pageLoaded: boolean;
  onIntroComplete: () => void;
}

const IntroManager = ({ pageLoaded, onIntroComplete }: IntroManagerProps) => {
  const [showIntroOverlay, setShowIntroOverlay] = useState(true);
  const [introCompleted, setIntroCompleted] = useState(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Force intro to complete after timeout, even if animations fail
  useEffect(() => {
    // Clear any existing timeout to prevent memory leaks
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    
    console.log("IntroManager effect running, pageLoaded:", pageLoaded);
    
    if (!pageLoaded) {
      console.log("Page not loaded yet, returning");
      return;
    }
    
    console.log("Preparing intro animation...");
    document.body.style.overflow = "hidden"; // Prevent scrolling during intro
    
    // Add safety timeout to ensure intro completes even if animations fail
    safetyTimeoutRef.current = setTimeout(() => {
      if (!introCompleted) {
        console.log("Safety timeout: forcing intro completion");
        handleIntroComplete();
      }
    }, 8000); // 8-second safety timeout
    
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      document.body.style.overflow = "auto"; // Ensure scrolling is re-enabled
    };
  }, [pageLoaded, introCompleted]);

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
  
  // Skip intro if page isn't loaded yet
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
