
import React, { useEffect } from "react";
import AnimationContainer from "./components/AnimationContainer";
import LogoTransition from "./components/LogoTransition";
import useAnimationSequence from "./hooks/useAnimationSequence";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  // Sicurezza aggiuntiva: forza il completamento dopo un tempo molto breve
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      console.log("FALLBACK ULTRA-SICURO: forzatura completamento");
      onComplete();
    }, 1000); // Ridotto a 1 secondo
    
    return () => clearTimeout(safetyTimer);
  }, [onComplete]);

  // Implementazione minima - solo logo senza animazione dell'occhio
  try {
    return (
      <AnimationContainer>
        <LogoTransition visible={true} />
      </AnimationContainer>
    );
  } catch (error) {
    console.error("Errore critico nell'animazione di intro:", error);
    // Chiamata onComplete per garantire che l'app continui a funzionare
    setTimeout(onComplete, 0);
    return null;
  }
};

export default IntroAnimation;
