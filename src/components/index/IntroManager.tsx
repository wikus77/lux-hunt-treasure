
import { useState, useEffect } from "react";
import IntroOverlay from "@/components/intro/IntroOverlay";
import LaserRevealIntro from "@/components/intro/LaserRevealIntro";

interface IntroManagerProps {
  pageLoaded: boolean;
  onIntroComplete: () => void;
}

const IntroManager = ({ pageLoaded, onIntroComplete }: IntroManagerProps) => {
  const [showIntroOverlay, setShowIntroOverlay] = useState(false); // Start with false to skip if issues
  const [introCompleted, setIntroCompleted] = useState(false);
  
  useEffect(() => {
    if (!pageLoaded) return;
    
    // Skip intro for now to fix blank screen issues
    const hasSeenIntro = localStorage.getItem('introShown') === 'true';
    
    if (hasSeenIntro) {
      console.log("Skipping intro, already shown");
      setIntroCompleted(true);
      document.body.style.overflow = "auto"; // Enable scrolling
      onIntroComplete(); // Inform parent component
    } else {
      // For safety, set a timeout to force completion if intro gets stuck
      const timeout = setTimeout(() => {
        console.log("Force completing intro after timeout");
        handleIntroComplete();
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [pageLoaded, onIntroComplete]);

  const handleIntroComplete = () => {
    localStorage.setItem('introShown', 'true');
    setIntroCompleted(true);
    document.body.style.overflow = "auto";
    onIntroComplete();
  };

  // Simplified rendering to prevent blank screen
  if (introCompleted || !pageLoaded) {
    return null;
  }
  
  if (showIntroOverlay) {
    return <IntroOverlay onComplete={() => setShowIntroOverlay(false)} />;
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
