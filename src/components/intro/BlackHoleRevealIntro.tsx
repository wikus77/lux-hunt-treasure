
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./black-hole-styles.css";

interface BlackHoleRevealIntroProps {
  onComplete: () => void;
}

const BlackHoleRevealIntro: React.FC<BlackHoleRevealIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Control animation stages
  useEffect(() => {
    // Initialize sound if supported by browser
    try {
      audioRef.current = new Audio("/sounds/buzz.mp3");
      audioRef.current.volume = 0.4;
    } catch (err) {
      console.log("Audio initialization failed:", err);
    }
    
    // Initial black state
    const initialTimeout = setTimeout(() => {
      setStage(1); // Start gravitational distortion
      // Play sound effect
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log("Audio play error:", err));
      }
    }, 1000);
    
    // Auto-complete the entire animation after 8 seconds maximum
    const maxDurationTimeout = setTimeout(() => {
      onComplete();
    }, 8000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(maxDurationTimeout);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [onComplete]);
  
  // Control animation sequence stages
  useEffect(() => {
    if (stage === 1) {
      // Gravitational distortion phase
      const timeout = setTimeout(() => {
        setStage(2); // Black hole formation
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 2) {
      // Black hole formation and implosion
      const timeout = setTimeout(() => {
        setStage(3); // Implosion and flash
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 3) {
      // Flash and energy burst
      const timeout = setTimeout(() => {
        setStage(4); // Logo emergence
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 4) {
      // Logo emergence and particles
      const timeout = setTimeout(() => {
        setStage(5); // Final stabilization with glow
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
    
    if (stage === 5) {
      // Final glow and transition out
      const completeTimeout = setTimeout(() => {
        setStage(6); // Start fade out
      }, 1000);
      
      return () => clearTimeout(completeTimeout);
    }
    
    if (stage === 6) {
      // Fade out transition to landing page
      const fadeOutTimeout = setTimeout(() => {
        onComplete();
      }, 1500);
      
      return () => clearTimeout(fadeOutTimeout);
    }
  }, [stage, onComplete]);
  
  // Generate space dust particles for background effect
  const renderSpaceDust = () => {
    return Array.from({ length: 60 }).map((_, i) => (
      <motion.div
        key={`dust-${i}`}
        className="space-dust"
        initial={{ 
          x: `${Math.random() * 100}%`, 
          y: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.5,
          scale: Math.random() * 0.8 + 0.2
        }}
        animate={{ 
          opacity: [
            Math.random() * 0.3, 
            Math.random() * 0.6, 
            Math.random() * 0.3
          ],
          scale: [
            Math.random() * 0.8 + 0.2,
            Math.random() * 0.9 + 0.5,
            Math.random() * 0.8 + 0.2
          ]
        }}
        transition={{ 
          duration: Math.random() * 4 + 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          background: i % 3 === 0 ? "#00BFFF" : i % 3 === 1 ? "#FFFFFF" : "#AAAAAA",
          borderRadius: "50%"
        }}
      />
    ));
  };

  return (
    <motion.div 
      className="black-hole-container"
      initial={{ opacity: 1 }}
      animate={{ opacity: stage === 6 ? 0 : 1 }}
      transition={{ duration: stage === 6 ? 1.5 : 0 }}
    >
      {/* Background space dust */}
      {renderSpaceDust()}
      
      {/* Gravitational rings - Stage 1 */}
      {stage >= 1 && (
        <div className="gravitational-rings">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={`ring-${i}`}
              className="gravity-ring"
              initial={{ 
                opacity: 0, 
                scale: 0.2,
              }}
              animate={{ 
                opacity: [0, 0.6, 0.3],
                scale: [0.2, 0.6 + (i * 0.3), 0.9 + (i * 0.4)],
                rotateZ: [0, i % 2 === 0 ? 45 : -45]
              }}
              transition={{ 
                duration: 2.5,
                times: [0, 0.6, 1],
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
      
      {/* Black hole center formation - Stage 2 */}
      {stage >= 2 && (
        <div className="black-hole-formation">
          <motion.div
            className="accretion-disk"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: stage >= 3 ? [0.8, 1, 0] : [0, 0.8, 0.6],
              scale: stage >= 3 ? [1, 1.2, 0.1] : [0, 1, 1]
            }}
            transition={{ 
              duration: stage >= 3 ? 1.5 : 2,
              times: stage >= 3 ? [0, 0.4, 1] : [0, 0.5, 1]
            }}
          />
          
          <motion.div
            className="event-horizon"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: stage >= 3 ? [1, 0.5, 0] : [0, 1, 0.8],
              scale: stage >= 3 ? [0.8, 0.5, 0] : [0, 0.8, 0.7]
            }}
            transition={{ 
              duration: stage >= 3 ? 1.5 : 2,
              times: stage >= 3 ? [0, 0.4, 1] : [0, 0.5, 1]
            }}
          />
        </div>
      )}
      
      {/* Energy flash - Stage 3 */}
      {stage >= 3 && (
        <motion.div
          className="energy-flash"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.9, 0.2], 
            scale: [0.2, 1.5, 2]
          }}
          transition={{ 
            duration: 1.5, 
            times: [0, 0.3, 1],
            ease: "easeOut"
          }}
        />
      )}
      
      {/* Gravitational lensing effect - visible during stages 2-3 */}
      {(stage === 2 || stage === 3) && (
        <div className="gravitational-lensing">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={`lens-${i}`}
              className="lens-streak"
              initial={{ 
                opacity: 0,
                rotate: (i * 15) % 360,
                scaleX: 0
              }}
              animate={{ 
                opacity: [0, 0.7, 0],
                scaleX: [0, 1, 0]
              }}
              transition={{ 
                duration: 2,
                delay: Math.random() * 0.5,
                repeatType: "loop",
                repeat: 1
              }}
              style={{
                rotate: `${i * 15}deg`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Particle convergence for logo formation - Stage 4 */}
      {stage >= 4 && (
        <div className="particle-convergence">
          {Array.from({ length: 80 }).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="converging-particle"
              initial={{ 
                x: `${Math.random() * 200 - 100}%`, 
                y: `${Math.random() * 200 - 100}%`,
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                x: 0,
                y: 0,
                opacity: [0, 0.8, 0],
                scale: [0, 0.8, 0]
              }}
              transition={{ 
                duration: 2 + Math.random() * 1,
                delay: Math.random() * 0.5,
                ease: "easeInOut",
                times: [0, 0.7, 1]
              }}
              style={{
                backgroundColor: i % 5 === 0 ? "#00BFFF" : 
                               i % 5 === 1 ? "#FFFFFF" : 
                               i % 5 === 2 ? "#87CEFA" :
                               i % 5 === 3 ? "#E0FFFF" : "#AAAAAA",
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                borderRadius: "50%"
              }}
            />
          ))}
        </div>
      )}
      
      {/* Logo reveal */}
      <div className="logo-container">
        {/* M1 part */}
        <AnimatePresence>
          {stage >= 4 && (
            <motion.div
              className="logo-part m1-part"
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={{ 
                opacity: 1, 
                filter: "blur(0px)",
                y: stage >= 6 ? [0, 10] : 0,
                scale: stage >= 6 ? [1, 0.95] : 1,
              }}
              transition={{ 
                duration: stage >= 6 ? 1.5 : 1.2, 
                delay: stage >= 5 ? 0 : 0.2 
              }}
            >
              <span className="text-cyan-400">M1</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* SSION part */}
        <AnimatePresence>
          {stage >= 4 && (
            <motion.div
              className="logo-part ssion-part"
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={{ 
                opacity: 1, 
                filter: "blur(0px)",
                y: stage >= 6 ? [0, 10] : 0,
                scale: stage >= 6 ? [1, 0.95] : 1,
              }}
              transition={{ 
                duration: stage >= 6 ? 1.5 : 1.2, 
                delay: stage >= 5 ? 0.1 : 0.8 
              }}
            >
              SSION
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Enhanced glow effect */}
        {stage >= 4 && (
          <motion.div 
            className="logo-glow"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: stage >= 6 ? [0.8, 0] : [0, 0.8],
              scale: stage >= 6 ? [1, 1.2] : [0.8, 1]
            }}
            transition={{ 
              duration: stage >= 6 ? 1.5 : 1.2
            }}
          />
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
