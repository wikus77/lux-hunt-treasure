
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./intro-animation.css";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [stage, setStage] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Effect to handle animation stages and timing
  useEffect(() => {
    // Initialize sound
    audioRef.current = new Audio("/sounds/buzz.mp3");
    audioRef.current.volume = 0.4;
    
    // Stage 0: Initial black screen (1s)
    const timer1 = setTimeout(() => {
      setStage(1); // Move to electrical discharge
      // Play sound effect
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log("Audio play error:", err));
      }
    }, 1000);
    
    // Stage 1: Electrical discharge (1s)
    const timer2 = setTimeout(() => {
      setStage(2); // Move to glitch effects
    }, 2000);
    
    // Stage 2: Glitch effects (1.5s)
    const timer3 = setTimeout(() => {
      setStage(3); // Move to logo reveal
    }, 3500);
    
    // Stage 3: Logo reveal (1s)
    const timer4 = setTimeout(() => {
      setStage(4); // Move to motto reveal
    }, 4500);
    
    // Stage 4: "IT IS POSSIBLE" (1s)
    const timer5 = setTimeout(() => {
      setStage(5); // Start fade out
    }, 5500);
    
    // Stage 5: Fade out animation (1s)
    const timer6 = setTimeout(() => {
      onComplete(); // Animation complete, transition to landing page
    }, 6500);
    
    // Cleanup timers
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [onComplete]);
  
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black z-[9999]"
      animate={{ opacity: stage === 5 ? 0 : 1 }}
      transition={{ duration: stage === 5 ? 1 : 0 }}
    >
      {/* Electrical discharge - Stage 1 */}
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div 
            className="absolute h-[2px] bg-cyan-400 w-full left-0 top-1/2 transform -translate-y-1/2"
            initial={{ scaleX: 0, filter: "brightness(1)" }}
            animate={{ 
              scaleX: 1, 
              filter: ["brightness(1.5)", "brightness(3)", "brightness(1.5)"]
            }}
            transition={{ 
              duration: 0.5,
              filter: { repeat: 2, duration: 0.25 } 
            }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      
      {/* Glitch effects - Stage 2 */}
      <AnimatePresence>
        {stage >= 2 && (
          <>
            {/* Binary code background */}
            <motion.div 
              className="absolute inset-0 overflow-hidden opacity-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              exit={{ opacity: 0 }}
            >
              <div className="binary-rain">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="binary-column" style={{ 
                    left: `${i * 5}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}>
                    {Array.from({ length: 30 }).map((_, j) => (
                      <span key={j} className="text-xs sm:text-sm text-cyan-400">
                        {Math.random() > 0.5 ? '1' : '0'}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Horizontal glitch lines */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-[1px] bg-white/70 w-full left-0"
                style={{ top: `${15 + i * 10}%` }}
                initial={{ scaleX: 0, x: i % 2 === 0 ? '-100%' : '100%' }}
                animate={{ scaleX: 1, x: 0 }}
                transition={{ 
                  delay: 0.1 * i,
                  duration: 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
      
      {/* Central light pulse - Stage 3 */}
      <AnimatePresence>
        {stage >= 3 && (
          <motion.div 
            className="absolute"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 0.5, 1, 0.7], 
              scale: [0.5, 0.8, 1.2, 1],
              filter: ["blur(10px)", "blur(5px)", "blur(2px)", "blur(0px)"]
            }}
            transition={{ 
              duration: 1,
              times: [0, 0.3, 0.6, 1],
            }}
          >
            {/* Main M1SSION logo */}
            <div className="logo-container">
              <div className="mission-text">M1SSION</div>
              <div className="scan-line"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* "IT IS POSSIBLE" text - Stage 4 */}
      <AnimatePresence>
        {stage >= 4 && (
          <motion.div
            className="absolute bottom-[30%] text-yellow-300 font-orbitron tracking-wider text-lg sm:text-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            IT IS POSSIBLE
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default IntroAnimation;
