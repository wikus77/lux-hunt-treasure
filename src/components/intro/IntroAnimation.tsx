
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  
  // Aggiungi info di diagnostica
  const logStage = (stage: string) => {
    console.log(`Animation stage: ${stage}`);
    setDebugInfo(prev => ({
      stages: [...prev.stages, `${new Date().toISOString().substr(11, 8)} - ${stage}`]
    }));
  };
  
  // Super safety timer to ensure onComplete is called even if animation fails
  useEffect(() => {
    logStage("Component mounted");
    const safetyTimer = setTimeout(() => {
      logStage("Safety timeout triggered");
      onComplete();
    }, 8000);
    
    return () => clearTimeout(safetyTimer);
  }, [onComplete]);
  
  // Control the animation sequence
  useEffect(() => {
    try {
      logStage(`Starting animation sequence - Stage ${animationStage}`);
      
      const timers = [
        // Stage 1: Initial pulsation appears
        setTimeout(() => {
          logStage("Setting stage 1");
          setAnimationStage(1);
        }, 1000),
        
        // Stage 2: Eye starts opening
        setTimeout(() => {
          logStage("Setting stage 2");
          setAnimationStage(2);
        }, 2000),
        
        // Stage 3: Eye fully open, show logo
        setTimeout(() => {
          logStage("Setting stage 3");
          setAnimationStage(3);
        }, 3500),
        
        // Stage 4: Show slogan
        setTimeout(() => {
          logStage("Setting stage 4");
          setAnimationStage(4);
        }, 4500),
        
        // Complete animation
        setTimeout(() => {
          logStage("Animation complete - Calling onComplete");
          onComplete();
        }, 7000)
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    } catch (error) {
      console.error("Error in animation sequence:", error);
      logStage(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setHasError(true);
      onComplete();
    }
  }, [onComplete, animationStage]);

  // Play the mechanical sound when eye opens
  useEffect(() => {
    if (animationStage === 2) {
      try {
        logStage("Playing mechanical sound");
        const mechSound = new Audio("/sounds/mechanical-sound.mp3");
        mechSound.volume = 0.4;
        mechSound.play().catch(err => {
          console.log("Error playing sound:", err);
          logStage(`Sound error: ${err.message}`);
        });
      } catch (error) {
        console.log("Error playing mechanical sound:", error);
        logStage(`Sound load error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }, [animationStage]);
  
  // Play the power-up sound when the logo appears
  useEffect(() => {
    if (animationStage === 3) {
      try {
        logStage("Playing power-up sound");
        const powerUpSound = new Audio("/sounds/power-up-sound.mp3");
        powerUpSound.volume = 0.3;
        powerUpSound.play().catch(err => {
          console.log("Error playing sound:", err);
          logStage(`Sound error: ${err.message}`);
        });
      } catch (error) {
        console.log("Error playing power-up sound:", error);
        logStage(`Sound load error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }, [animationStage]);

  // This helps detect if assets are failing to load
  useEffect(() => {
    window.addEventListener('error', (e) => {
      if (e.target instanceof HTMLImageElement || e.target instanceof HTMLAudioElement) {
        console.error(`Resource error: Failed to load ${e.target.src}`);
        logStage(`Resource load error: ${e.target.src}`);
      }
    }, true);
  }, []);

  // If there's an error, render a minimal version to avoid blocking the page
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
        
        {/* Energy pattern that radiates when eye fully opens */}
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
      
      {/* Diagnostics overlay (visibile solo durante i test) */}
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
