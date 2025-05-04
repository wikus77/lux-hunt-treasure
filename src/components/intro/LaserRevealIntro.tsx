
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./laser-reveal-styles.css";

interface LaserRevealIntroProps {
  onComplete: () => void;
}

const LaserRevealIntro: React.FC<LaserRevealIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(0);
  
  // Control animation stages
  useEffect(() => {
    // Initial delay before starting the laser
    const initialTimeout = setTimeout(() => {
      setStage(1); // Start laser movement
    }, 500);
    
    // Auto-complete the entire animation after 6 seconds maximum
    const maxDurationTimeout = setTimeout(() => {
      onComplete();
    }, 6000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(maxDurationTimeout);
    };
  }, [onComplete]);
  
  // Control logo reveal stages
  useEffect(() => {
    if (stage === 1) {
      // Laser moves across screen, then reveal logo
      const timeout = setTimeout(() => {
        setStage(2); // Show M1
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 2) {
      // Reveal rest of logo
      const timeout = setTimeout(() => {
        setStage(3); // Show SSION
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 3) {
      // Final glow effect and exit
      const timeout = setTimeout(() => {
        setStage(4); // Final glow state
      }, 1000);
      
      const completeTimeout = setTimeout(() => {
        onComplete();
      }, 2000);
      
      return () => {
        clearTimeout(timeout);
        clearTimeout(completeTimeout);
      };
    }
  }, [stage, onComplete]);

  return (
    <motion.div 
      className="laser-intro-container"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Laser beam */}
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div 
            className="laser-beam"
            initial={{ left: "-20%", width: "20%" }}
            animate={{ 
              left: stage >= 2 ? "120%" : "40%",
              width: ["20%", "30%", "20%"]
            }}
            transition={{ 
              duration: stage >= 2 ? 2 : 1,
              ease: "easeInOut",
              width: {
                duration: 0.8,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Logo parts */}
      <div className="logo-container">
        {/* M1 part */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              className="logo-part m1-part"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-cyan-400">M1</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* SSION part */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              className="logo-part ssion-part"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8 }}
            >
              SSION
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Final glow effect */}
        {stage >= 4 && (
          <div className="logo-glow"></div>
        )}
      </div>
      
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

export default LaserRevealIntro;
