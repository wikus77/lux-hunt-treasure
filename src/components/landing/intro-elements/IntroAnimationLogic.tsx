
import React, { useEffect } from "react";
import { useAudio } from "@/hooks/useAudio";

interface IntroAnimationLogicProps {
  onComplete: () => void;
  setStage: React.Dispatch<React.SetStateAction<number>>;
}

const IntroAnimationLogic: React.FC<IntroAnimationLogicProps> = ({ 
  onComplete, 
  setStage 
}) => {
  const { play, stop } = useAudio("/sounds/portal-open.mp3", { volume: 0.7 });
  
  // Progress through animation stages
  useEffect(() => {
    // Initial black screen with electrical crackle
    const timer1 = setTimeout(() => {
      setStage(1); // Start glitchy lines and code fragments
      play();
    }, 800);
    
    // Systems power up - sections light up
    const timer2 = setTimeout(() => {
      setStage(2); // Show more elements powering up
    }, 2500);
    
    // Energy surge and logo appears
    const timer3 = setTimeout(() => {
      setStage(3); // Show logo with energy pulse
    }, 4000);
    
    // Slogan appears for transition
    const timer4 = setTimeout(() => {
      setStage(4); // Show slogan
    }, 5500);
    
    // Complete animation
    const timer5 = setTimeout(() => {
      stop();
      onComplete();
    }, 7000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      stop();
    };
  }, [onComplete, play, stop, setStage]);
  
  return null; // This component doesn't render anything
};

export default IntroAnimationLogic;
