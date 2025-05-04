
import { useEffect, useState } from "react";

interface UseAnimationSequenceProps {
  onComplete: () => void;
  fallbackTime?: number;
}

const useAnimationSequence = ({ onComplete, fallbackTime = 3000 }: UseAnimationSequenceProps) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  // SUPER FALLBACK: Always call onComplete after a short period
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      console.log("Safety fallback: forcing animation completion");
      onComplete();
    }, fallbackTime);
    
    return () => clearTimeout(fallbackTimer);
  }, [onComplete, fallbackTime]);
  
  // Animation sequence with error handling
  useEffect(() => {
    try {
      const timers = [
        // Stage 1: Initial pulsation
        setTimeout(() => {
          setAnimationStage(1);
        }, 400),
        
        // Stage 2: Eye begins to open
        setTimeout(() => {
          setAnimationStage(2);
        }, 800),
        
        // Stage 3: Eye fully open, show logo
        setTimeout(() => {
          setAnimationStage(3);
        }, 1400),
        
        // Complete animation
        setTimeout(() => {
          onComplete();
        }, 2500)
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    } catch (error) {
      console.error("Error in animation sequence:", error);
      setHasError(true);
      onComplete(); // Call onComplete to not block the user
    }
  }, [onComplete]);

  return { animationStage, hasError };
};

export default useAnimationSequence;
