
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles/glitch-intro.css";

interface GlitchIntroProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const GlitchIntro: React.FC<GlitchIntroProps> = ({ onComplete, onSkip }) => {
  const [showText, setShowText] = useState(false);
  
  // Control the animation sequence
  useEffect(() => {
    // Show the date text after a short delay
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 700);
    
    // Auto-complete the intro after 2.5 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);
    
    return () => {
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);
  
  return (
    <motion.div 
      className="glitch-intro-container"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="glitch-content">
        <h1 className="glitch-logo" data-text="M1SSION">
          <span className="text-cyan-400">M1</span>SSION
        </h1>
        
        <AnimatePresence>
          {showText && (
            <motion.div
              className="glitch-date"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              STARTS JUNE 19
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {onSkip && (
        <button 
          onClick={onSkip} 
          className="skip-button"
          aria-label="Skip intro"
        >
          SKIP
        </button>
      )}
    </motion.div>
  );
};

export default GlitchIntro;
