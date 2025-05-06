
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
    if (!pageLoaded) return;
    
    // Force showing the intro every time for testing purposes
    // Comment out the localStorage check to make sure intro always shows
    console.log("Preparing intro animation...");
    document.body.style.overflow = "hidden"; // Prevent scrolling during intro
    
    /* Uncomment this when you want to revert to normal behavior
    // Check if user has seen the intro before
    const hasSeenIntro = localStorage.getItem('introShown') === 'true';
    
    if (hasSeenIntro) {
      // Skip intro if already seen
      console.log("Intro already shown, skipping...");
      setShowIntroOverlay(false);
      setIntroCompleted(true);
      document.body.style.overflow = "auto"; // Enable scrolling
    } else {
      // Preparation for intro animation
      console.log("Preparing intro animation...");
      document.body.style.overflow = "hidden"; // Prevent scrolling during intro
    }
    */
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
    // Don't set introCompleted yet, we still need to show the LaserRevealIntro
    
    // Mark intro as shown - commented out to ensure laser reveal intro is shown
    // localStorage.setItem('introShown', 'true');
    
    // Restore scrolling
    document.body.style.overflow = "auto";
  };
  
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
