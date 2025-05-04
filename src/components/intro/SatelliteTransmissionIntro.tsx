
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./satellite-transmission-styles.css";

interface SatelliteTransmissionIntroProps {
  onComplete: () => void;
}

const SatelliteTransmissionIntro: React.FC<SatelliteTransmissionIntroProps> = ({ 
  onComplete 
}) => {
  const [stage, setStage] = useState<number>(0);
  const [typedText, setTypedText] = useState<string>("");
  const fullText = "RECEIVING ENCRYPTED SIGNAL...";
  
  // Simulate typing effect for "RECEIVING ENCRYPTED SIGNAL..."
  useEffect(() => {
    if (stage === 1 && typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.substring(0, typedText.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    }
    
    if (stage === 1 && typedText === fullText) {
      const timeout = setTimeout(() => {
        setStage(2);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [stage, typedText, fullText]);
  
  // Control animation stages
  useEffect(() => {
    // Initial noise/glitch (1-2 seconds)
    const initialTimeout = setTimeout(() => {
      setStage(1); // Start typing text
    }, 1500);
    
    // Auto-complete the entire animation after 6 seconds maximum
    const maxDurationTimeout = setTimeout(() => {
      onComplete();
    }, 6000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(maxDurationTimeout);
    };
  }, [onComplete]);
  
  // Handle M1SSION logo reveal
  useEffect(() => {
    if (stage === 2) {
      const timeout = setTimeout(() => {
        setStage(3); // Show logo with scan effect
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 3) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [stage, onComplete]);

  return (
    <motion.div 
      className="satellite-intro-container"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Static noise overlay */}
      <div className="noise-overlay"></div>
      
      {/* Scan lines effect */}
      <div className="scan-lines"></div>
      
      {/* Glitch effect */}
      <div className={`glitch-effect ${stage >= 1 ? "active" : ""}`}></div>
      
      {/* Typed text */}
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div 
            className="encrypted-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="terminal-text">{typedText}</span>
            <span className="cursor">_</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* M1SSION Logo reveal */}
      <AnimatePresence>
        {stage >= 2 && (
          <motion.div 
            className="mission-logo-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="scan-reveal">
              <motion.h1 
                className="mission-logo"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                M1SSION
              </motion.h1>
            </div>
            
            {stage >= 3 && (
              <motion.p 
                className="mission-motto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                IT IS POSSIBLE
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Skip button */}
      <motion.button
        className="skip-button"
        onClick={onComplete}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        SKIP
      </motion.button>
    </motion.div>
  );
};

export default SatelliteTransmissionIntro;
