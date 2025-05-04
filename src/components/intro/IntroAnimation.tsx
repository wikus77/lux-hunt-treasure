
import React, { useEffect } from "react";
import AnimationContainer from "./components/AnimationContainer";
import EyeAnimation from "./components/EyeAnimation";
import LogoTransition from "./components/LogoTransition";
import useAnimationSequence from "./hooks/useAnimationSequence";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  // Sicurezza aggiuntiva: forza il completamento anche se il componente non viene smontato correttamente
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      onComplete();
    }, 3000);
    
    return () => clearTimeout(safetyTimer);
  }, [onComplete]);

  // Gestione sicura degli errori
  try {
    const { animationStage, hasError } = useAnimationSequence({ 
      onComplete, 
      fallbackTime: 2000  // Ridotto per essere più veloce
    });

    // Se c'è un errore, non renderizzare nulla per evitare di bloccare il resto della pagina
    if (hasError) {
      console.log("Errore rilevato, salto l'animazione intro");
      return null;
    }

    // Rendering dei componenti dell'animazione
    return (
      <AnimationContainer>
        <EyeAnimation animationStage={animationStage} />
        <LogoTransition visible={animationStage >= 3} />
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
