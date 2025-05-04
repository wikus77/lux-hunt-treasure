
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./black-hole-styles.css";

interface BlackHoleRevealIntroProps {
  onComplete: () => void;
}

const BlackHoleRevealIntro: React.FC<BlackHoleRevealIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(0);
  
  // Control animation stages
  useEffect(() => {
    // Initial black state
    const initialTimeout = setTimeout(() => {
      setStage(1); // Start gravitational distortion
    }, 1000);
    
    // Auto-complete the entire animation after 8 seconds maximum
    const maxDurationTimeout = setTimeout(() => {
      onComplete();
    }, 8000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(maxDurationTimeout);
    };
  }, [onComplete]);
  
  // Control animation sequence stages
  useEffect(() => {
    if (stage === 1) {
      // Gravitational distortion phase
      const timeout = setTimeout(() => {
        setStage(2); // Implosion and flash
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 2) {
      // Implosion and flash
      const timeout = setTimeout(() => {
        setStage(3); // Logo emergence
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 3) {
      // Logo emergence and dust particles
      const timeout = setTimeout(() => {
        setStage(4); // Final stabilization
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 4) {
      // Final glow and transition out
      const completeTimeout = setTimeout(() => {
        onComplete();
      }, 2000);
      
      return () => clearTimeout(completeTimeout);
    }
  }, [stage, onComplete]);

  return (
    <motion.div 
      className="black-hole-container"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Black hole center distortion */}
      <div className="black-hole-center">
        {stage >= 1 && (
          <motion.div 
            className="gravitational-distortion"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: stage >= 2 ? [1, 1.3, 0.2] : 1, 
              opacity: stage >= 2 ? [0.8, 1, 0] : 0.8 
            }}
            transition={{ 
              duration: stage >= 2 ? 1.5 : 2,
              times: stage >= 2 ? [0, 0.7, 1] : [0, 1]
            }}
          />
        )}
        
        {/* Flash effect */}
        {stage >= 2 && (
          <motion.div 
            className="energy-flash"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 1, 0.8], scale: [0.2, 1.5, 1] }}
            transition={{ duration: 1.5, times: [0, 0.3, 1] }}
          />
        )}
        
        {/* Cosmic dust particles */}
        {stage >= 3 && (
          <div className="cosmic-particles">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                initial={{ 
                  x: `calc(${Math.random() * 200 - 100}px)`, 
                  y: `calc(${Math.random() * 200 - 100}px)`,
                  opacity: 0
                }}
                animate={{ 
                  x: 0,
                  y: 0,
                  opacity: [0, 0.8, 0]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 1.5,
                  delay: Math.random() * 0.5,
                  ease: "easeInOut"
                }}
                style={{
                  backgroundColor: i % 3 === 0 ? "#00BFFF" : i % 3 === 1 ? "#FFFFFF" : "#AAAAAA",
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Logo reveal */}
      <div className="logo-container">
        {/* M1 part */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              className="logo-part m1-part"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, delay: stage >= 4 ? 0 : 0.2 }}
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
              transition={{ duration: 1.2, delay: stage >= 4 ? 0 : 0.8 }}
            >
              SSION
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Final glow effect */}
        {stage >= 4 && (
          <div className="logo-glow black-hole-glow"></div>
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

export default BlackHoleRevealIntro;
