
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./styles/intro-base.css";
import "./styles/intro-animations.css";
import "./styles/intro-effects.css";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  // SUPER FALLBACK: Chiama sempre onComplete dopo un breve periodo
  useEffect(() => {
    // Fallback di sicurezza ultra-veloce
    const fallbackTimer = setTimeout(() => {
      console.log("Fallback di sicurezza: forza completamento animazione");
      onComplete();
    }, 3000); // 3 secondi massimo
    
    return () => clearTimeout(fallbackTimer);
  }, [onComplete]);
  
  // Sequenza di animazione semplificata con gestione errori
  useEffect(() => {
    try {
      const timers = [
        // Stage 1: Pulsazione iniziale
        setTimeout(() => {
          setAnimationStage(1);
        }, 400),
        
        // Stage 2: L'occhio inizia ad aprirsi
        setTimeout(() => {
          setAnimationStage(2);
        }, 800),
        
        // Stage 3: Occhio completamente aperto, mostra logo
        setTimeout(() => {
          setAnimationStage(3);
        }, 1400),
        
        // Completa animazione
        setTimeout(() => {
          onComplete();
        }, 2500)
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    } catch (error) {
      console.error("Errore nella sequenza animazione:", error);
      setHasError(true);
      onComplete(); // Chiamiamo onComplete per non bloccare l'utente
    }
  }, [onComplete]);

  // Se c'è un errore, non renderizzare nulla per non bloccare il resto della pagina
  if (hasError) {
    return null;
  }

  // Rendering semplificato dell'animazione
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {/* Eye container */}
      <div className="eye-container">
        {/* The mechanical eye */}
        <div className={`mechanical-eye ${animationStage >= 2 ? 'opening' : ''}`}>
          <div className="eye-outer-ring"></div>
          <div className="eye-middle-ring"></div>
          <div className="eye-inner-ring"></div>
          
          {/* Iris segments */}
          <div className="iris-segments">
            <div className="iris-segment"></div>
            <div className="iris-segment"></div>
            <div className="iris-segment"></div>
            <div className="iris-segment"></div>
          </div>
          
          <div className="eye-pupil"></div>
        </div>
        
        {/* Center pulsation */}
        {animationStage >= 1 && (
          <div className="center-pulse"></div>
        )}
        
        {/* Logo transition */}
        {animationStage >= 3 && (
          <div className="logo-container">
            <div className="mission-text">
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default IntroAnimation;
