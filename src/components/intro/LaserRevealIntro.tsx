
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./laser-reveal-styles.css";

interface LaserRevealIntroProps {
  onComplete: () => void;
}

const LaserRevealIntro: React.FC<LaserRevealIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(0);
  
  // Control animation stages with precise timing
  useEffect(() => {
    // Initial delay before starting the animation sequence
    const initialTimeout = setTimeout(() => {
      setStage(1); // Initial power-up glow
    }, 500);
    
    // Set maximum duration as fallback
    const maxDurationTimeout = setTimeout(() => {
      onComplete();
    }, 6200);
    
    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(maxDurationTimeout);
    };
  }, [onComplete]);
  
  // Progress through animation stages
  useEffect(() => {
    if (stage === 1) {
      // Power-up phase complete, start laser scan
      const timeout = setTimeout(() => {
        setStage(2); // Laser scan starts
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 2) {
      // Laser scan complete, reveal M1
      const timeout = setTimeout(() => {
        setStage(3); // M1 revealed
      }, 900);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 3) {
      // M1 revealed, continue with SSION
      const timeout = setTimeout(() => {
        setStage(4); // SSION revealed
      }, 800);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 4) {
      // Full logo revealed, add glow effect
      const timeout = setTimeout(() => {
        setStage(5); // Final glow state
      }, 800);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 5) {
      // Begin transition out
      const timeout = setTimeout(() => {
        setStage(6); // Start fading out
      }, 800);
      
      const completeTimeout = setTimeout(() => {
        onComplete();
      }, 1600);
      
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
      animate={{ opacity: stage >= 6 ? [1, 0] : 1 }}
      transition={{ duration: stage >= 6 ? 1.2 : 0.5 }}
    >
      {/* Initial power-up glow */}
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div 
            className="power-up-glow"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.7, 0.3, 0.6, 0.4], scale: [0, 1, 0.8, 1.2, 1] }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut"
            }}
          />
        )}
      </AnimatePresence>

      {/* Loading bar indicator */}
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div 
            className="loading-bar"
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: stage >= 2 ? "100%" : "60%", opacity: [0, 1, 1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ 
              width: { duration: 1.4, ease: "easeInOut" },
              opacity: { duration: 0.8, times: [0, 0.2, 0.8, 1] } 
            }}
          />
        )}
      </AnimatePresence>

      {/* Main laser beam scanning effect */}
      <AnimatePresence>
        {stage >= 2 && (
          <>
            <motion.div 
              className="laser-beam primary-beam"
              initial={{ left: "-10%", width: "15%" }}
              animate={{ 
                left: stage >= 3 ? "120%" : "40%",
                width: ["15%", "20%", "15%"]
              }}
              exit={{ opacity: 0, left: "120%" }}
              transition={{ 
                duration: 1.5,
                ease: "easeInOut",
                width: {
                  duration: 0.8,
                  repeat: 2,
                  repeatType: "mirror"
                }
              }}
            />
            <motion.div 
              className="laser-beam secondary-beam"
              initial={{ left: "-15%", width: "10%" }}
              animate={{ 
                left: stage >= 3 ? "130%" : "60%",
                opacity: [0.6, 0.9, 0.7]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                delay: 0.15,
                duration: 1.7,
                ease: "easeInOut",
                opacity: {
                  duration: 0.5,
                  repeat: 3,
                  repeatType: "mirror"
                }
              }}
            />
            
            {/* Laser particles */}
            <div className="laser-particles-container">
              {[...Array(8)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="laser-particle"
                  style={{
                    top: `${30 + Math.random() * 40}%`,
                    left: `${20 + Math.random() * 60}%`,
                    width: `${2 + Math.random() * 4}px`,
                    height: `${2 + Math.random() * 4}px`,
                    opacity: Math.random() * 0.7 + 0.3
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1, 0.5, 0.8, 0],
                    opacity: [0, 0.8, 0.5, 0.7, 0],
                    y: [0, -10 - Math.random() * 20, -30 - Math.random() * 40]
                  }}
                  transition={{ 
                    duration: 1 + Math.random() * 1.5,
                    delay: 0.2 + Math.random() * 1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Logo container with 3D perspective effect */}
      <div className="logo-container">
        {/* M1 part */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              className="logo-part m1-part"
              initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
              animate={{ 
                opacity: 1, 
                filter: "blur(0px)", 
                y: 0,
                textShadow: stage >= 5 ? [
                  "0 0 15px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.5)",
                  "0 0 20px rgba(0, 191, 255, 0.9), 0 0 40px rgba(0, 191, 255, 0.6)",
                  "0 0 15px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.5)"
                ] : "0 0 15px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.5)"
              }}
              transition={{ 
                duration: 0.8,
                textShadow: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror"
                }
              }}
            >
              M1
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* SSION part */}
        <AnimatePresence>
          {stage >= 4 && (
            <motion.div
              className="logo-part ssion-part"
              initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.8 }}
            >
              SSION
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Final reflective glow effect */}
        <AnimatePresence>
          {stage >= 5 && (
            <motion.div 
              className="logo-glow"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: [0.2, 0.6, 0.3],
                scale: [0.9, 1.05, 1],
                filter: [
                  "blur(15px) brightness(1)",
                  "blur(20px) brightness(1.2)",
                  "blur(15px) brightness(1)"
                ]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
              }}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Final transition wave */}
      <AnimatePresence>
        {stage >= 6 && (
          <motion.div
            className="transition-wave"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: [0, 0.7, 0] }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
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

export default LaserRevealIntro;
