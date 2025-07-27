
import { useState, useEffect } from "react";
import IntroAnimationOptions from "@/components/intro/IntroAnimationOptions";
import LoadingScreen from "@/components/index/LoadingScreen";

interface IntroManagerProps {
  pageLoaded: boolean;
  onIntroComplete: () => void;
}

const IntroManager = ({ pageLoaded, onIntroComplete }: IntroManagerProps) => {
  const [introCompleted, setIntroCompleted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  
  console.log("✅ Phase 1 - IntroManager mounted");
  
  // Check if user has seen intro before
  useEffect(() => {
    if (!pageLoaded) return;
    
    console.log("✅ Phase 1 - Checking intro status");
    
    try {
      const hasSeenIntro = localStorage.getItem("hasSeenIntro");
      
      if (hasSeenIntro === "true") {
        console.log("✅ Phase 1 - User has seen intro, skipping to landing");
        setIntroCompleted(true);
        onIntroComplete();
      } else {
        console.log("✅ Phase 1 - First time user, showing laser intro");
        setShowIntro(true);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      // If error, skip intro
      setIntroCompleted(true);
      onIntroComplete();
    }
  }, [pageLoaded, onIntroComplete]);

  const handleIntroComplete = () => {
    console.log("✅ Phase 1 passed - Laser intro completed");
    
    try {
      localStorage.setItem("hasSeenIntro", "true");
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
    
    setIntroCompleted(true);
    onIntroComplete();
  };
  
  // Show loading while checking
  if (!pageLoaded || (!introCompleted && !showIntro)) {
    return <LoadingScreen />;
  }
  
  // Show intro if needed
  if (!introCompleted && showIntro) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black">
        <IntroAnimationOptions 
          onComplete={handleIntroComplete} 
          selectedOption={7} // Using LaserRevealIntro (ID: 7)
        />
      </div>
    );
  }
  
  // Intro completed, show nothing (landing will show)
  return null;
};

export default IntroManager;
