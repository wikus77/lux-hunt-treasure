
import React, { useEffect } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  // Chiamata immediata e incondizionata a onComplete
  useEffect(() => {
    console.log("IntroAnimation: chiamata immediata a onComplete");
    // Chiamata immediata del callback
    onComplete();
    
    // Backup ulteriore con timeout breve (100ms)
    const timer = setTimeout(() => {
      console.log("IntroAnimation: chiamata di backup a onComplete");
      onComplete();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Non rendiamo nulla, passiamo subito al contenuto principale
  return null;
};

export default IntroAnimation;
