
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./animated-logo-reveal.css";

interface AnimatedLogoRevealProps {
  onComplete: () => void;
  duration?: number;
}

const AnimatedLogoReveal = ({ onComplete, duration = 5000 }: AnimatedLogoRevealProps) => {
  const [animationStep, setAnimationStep] = useState(0);
  
  useEffect(() => {
    // First animation step - M1 appears
    const step1 = setTimeout(() => setAnimationStep(1), 500);
    
    // Second animation step - SSION appears
    const step2 = setTimeout(() => setAnimationStep(2), 1800);
    
    // Third animation step - "IT IS POSSIBLE" tagline appears
    const step3 = setTimeout(() => setAnimationStep(3), 3200);
    
    // Complete animation and trigger callback
    const completionTimer = setTimeout(() => {
      onComplete();
    }, duration);
    
    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(completionTimer);
    };
  }, [onComplete, duration]);
  
  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-m1ssion-deep-blue"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <div className="logo-reveal-container relative">
        {/* Grid overlay effect */}
        <div className="absolute inset-0 grid-overlay"></div>
        
        {/* Logo container with scanning effect */}
        <div className="logo-reveal-content relative">
          <div className="scan-line"></div>
          
          <div className="flex items-center justify-center">
            {/* M1 part with neon effect */}
            <motion.span 
              className="text-m1-cyan relative"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ 
                opacity: animationStep >= 1 ? 1 : 0, 
                filter: animationStep >= 1 ? "blur(0px)" : "blur(10px)" 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              M<span className="text-white">1</span>
            </motion.span>
            
            {/* SSION part with typing effect */}
            <motion.span 
              className="mission-text-typing"
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: animationStep >= 2 ? "auto" : 0,
                opacity: animationStep >= 2 ? 1 : 0,
              }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
              SSION
            </motion.span>
          </div>
          
          {/* Tagline */}
          <motion.div 
            className="absolute -bottom-12 left-0 right-0 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: animationStep >= 3 ? 1 : 0,
              y: animationStep >= 3 ? 0 : 10 
            }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-yellow-300 text-sm font-orbitron tracking-widest">
              IT IS POSSIBLE
            </span>
          </motion.div>
        </div>
        
        {/* Particles elements */}
        <div className="particles-container">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 5 + 3}s`,
                opacity: Math.random() * 0.5 + 0.3
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedLogoReveal;
