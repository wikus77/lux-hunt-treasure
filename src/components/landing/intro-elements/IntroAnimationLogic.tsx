
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
    // Initial black screen
    const timer1 = setTimeout(() => {
      setStage(1); // Electrical discharge across screen
      play();
    }, 1000);
    
    // Glitch visuals and code fragments
    const timer2 = setTimeout(() => {
      setStage(2); // Glitch effects and binary code
    }, 2500);
    
    // Central white glow with logo
    const timer3 = setTimeout(() => {
      setStage(3); // Show logo with light surge
    }, 4000);
    
    // Add "IT IS POSSIBLE" slogan
    const timer4 = setTimeout(() => {
      setStage(4); // Show slogan
    }, 5000);
    
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
