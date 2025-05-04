
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
  const [debugInfo, setDebugInfo] = useState<{stages: string[]}>({stages: []});
  
  // Funzione migliorata di diagnostica
  const logStage = (stage: string) => {
    console.log(`Animation stage: ${stage}`);
    setDebugInfo(prev => ({
      stages: [...prev.stages, `${new Date().toISOString().substr(11, 8)} - ${stage}`]
    }));
  };
  
  // Super timeout di sicurezza ridotto per garantire che onComplete venga chiamato anche in caso di errore
  useEffect(() => {
    logStage("Component mounted");
    const safetyTimer = setTimeout(() => {
      logStage("Safety timeout triggered - forcing animation complete");
      onComplete();
    }, 5000); // Ridotto da 8s a 5s
    
    return () => clearTimeout(safetyTimer);
  }, [onComplete]);
  
  // Sequenza di animazione con gestione errori migliorata
  useEffect(() => {
    try {
      logStage(`Starting animation sequence - Stage ${animationStage}`);
      
      const timers = [
        // Stage 1: Pulsazione iniziale
        setTimeout(() => {
          logStage("Setting stage 1");
          setAnimationStage(1);
        }, 800), // Ridotto da 1000ms a 800ms
        
        // Stage 2: L'occhio inizia ad aprirsi
        setTimeout(() => {
          logStage("Setting stage 2");
          setAnimationStage(2);
        }, 1600), // Ridotto da 2000ms a 1600ms
        
        // Stage 3: Occhio completamente aperto, mostra logo
        setTimeout(() => {
          logStage("Setting stage 3");
          setAnimationStage(3);
        }, 2800), // Ridotto da 3500ms a 2800ms
        
        // Stage 4: Mostra slogan
        setTimeout(() => {
          logStage("Setting stage 4");
          setAnimationStage(4);
        }, 3600), // Ridotto da 4500ms a 3600ms
        
        // Completa animazione
        setTimeout(() => {
          logStage("Animation complete - Calling onComplete");
          onComplete();
        }, 5000) // Ridotto da 7000ms a 5000ms
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    } catch (error) {
      console.error("Error in animation sequence:", error);
      logStage(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setHasError(true);
      onComplete(); // Chiamiamo onComplete per non bloccare l'utente
    }
  }, [onComplete, animationStage]);

  // Riproduci il suono meccanico quando l'occhio si apre, con miglior gestione errori
  useEffect(() => {
    if (animationStage === 2) {
      try {
        logStage("Playing mechanical sound");
        const mechSound = new Audio("/sounds/mechanical-sound.mp3");
        mechSound.volume = 0.4;
        mechSound.play().catch(err => {
          console.log("Error playing mechanical sound:", err);
          logStage(`Sound error: ${err.message}`);
          // Non blocchiamo l'animazione se il suono fallisce
        });
      } catch (error) {
        console.log("Error playing mechanical sound:", error);
        logStage(`Sound load error: ${error instanceof Error ? error.message : String(error)}`);
        // Non blocchiamo l'animazione se il suono fallisce
      }
    }
  }, [animationStage]);
  
  // Riproduci il suono power-up quando appare il logo, con miglior gestione errori
  useEffect(() => {
    if (animationStage === 3) {
      try {
        logStage("Playing power-up sound");
        const powerUpSound = new Audio("/sounds/power-up-sound.mp3");
        powerUpSound.volume = 0.3;
        powerUpSound.play().catch(err => {
          console.log("Error playing power-up sound:", err);
          logStage(`Sound error: ${err.message}`);
          // Non blocchiamo l'animazione se il suono fallisce
        });
      } catch (error) {
        console.log("Error playing power-up sound:", error);
        logStage(`Sound load error: ${error instanceof Error ? error.message : String(error)}`);
        // Non blocchiamo l'animazione se il suono fallisce
      }
    }
  }, [animationStage]);

  // Rileva errori di caricamento delle risorse
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (e.target instanceof HTMLImageElement || e.target instanceof HTMLAudioElement) {
        console.error(`Resource error: Failed to load ${e.target.src}`);
        logStage(`Resource load error: ${e.target.src}`);
      }
    };
    
    window.addEventListener('error', handleError, true);
    return () => window.removeEventListener('error', handleError, true);
  }, []);

  // Se c'è un errore, rendiamo una versione minima per evitare il blocco della pagina
  if (hasError) {
    return (
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1 }}
        onAnimationComplete={onComplete}
      >
        <div className="text-white text-2xl">M1SSION</div>
      </motion.div>
    );
  }

  // Rendering principale con miglioramenti per la compatibilità
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
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
            <div className="iris-segment"></div>
            <div className="iris-segment"></div>
            <div className="iris-segment"></div>
            <div className="iris-segment"></div>
          </div>
          
          {/* Circuit lines */}
          <div className="circuit-lines">
            <div className="circuit-line"></div>
            <div className="circuit-line"></div>
            <div className="circuit-line"></div>
            <div className="circuit-line"></div>
          </div>
          
          <div className="eye-pupil">
            {animationStage >= 3 && (
              <div className="pupil-reflection"></div>
            )}
          </div>
        </div>
        
        {/* Center pulsation */}
        {animationStage >= 1 && (
          <div className="center-pulse"></div>
        )}
        
        {/* Energy pattern che si irradia quando l'occhio è completamente aperto */}
        {animationStage >= 3 && (
          <div className="energy-pattern-container">
            <div className="energy-ring energy-ring-1"></div>
            <div className="energy-ring energy-ring-2"></div>
            <div className="energy-ring energy-ring-3"></div>
            <div className="energy-rays">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="energy-ray"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                ></div>
              ))}
            </div>
          </div>
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
        
        {/* Slogan */}
        {animationStage >= 4 && (
          <div className="mission-motto">
            IT IS POSSIBLE
          </div>
        )}
      </div>
      
      {/* Pannello diagnostico (visibile solo durante i test) */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="absolute bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs overflow-auto" style={{maxHeight: '200px'}}>
          <div>Stage: {animationStage}</div>
          <div>Log:</div>
          {debugInfo.stages.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default IntroAnimation;
