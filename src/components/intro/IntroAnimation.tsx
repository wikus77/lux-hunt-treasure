
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./intro-animation.css";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [animationStage, setAnimationStage] = useState(0);
  
  // Control the animation sequence
  useEffect(() => {
    const timers = [
      // Stage 1: Initial pulsation appears
      setTimeout(() => setAnimationStage(1), 1000),
      
      // Stage 2: Eye starts opening
      setTimeout(() => setAnimationStage(2), 2000),
      
      // Stage 3: Eye fully open, show logo
      setTimeout(() => setAnimationStage(3), 3500),
      
      // Stage 4: Show slogan
      setTimeout(() => setAnimationStage(4), 4500),
      
      // Complete animation
      setTimeout(() => onComplete(), 7000)
    ];
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [onComplete]);

  // Play the mechanical sound when eye opens
  useEffect(() => {
    if (animationStage === 2) {
      const mechSound = new Audio("/sounds/mechanical-sound.mp3");
      mechSound.volume = 0.4;
      mechSound.play().catch(err => console.log("Error playing sound:", err));
    }
  }, [animationStage]);

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
    </motion.div>
  );
};

export default IntroAnimation;
