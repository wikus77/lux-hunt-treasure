
import React, { useState } from "react";
import { motion } from "framer-motion";
import "./styles/base-intro-styles.css";
import "./styles/matrix-animation.css";
import "./styles/glitch-animation.css";
import "./styles/particle-animation.css";
import "./styles/scanner-animation.css";
import "./styles/3d-animation.css";

// Animation Option 1: Tech Matrix Effect
const MatrixAnimation = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      className="fixed inset-0 bg-black flex items-center justify-center z-[9999]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, delay: 5 }}
      onAnimationComplete={onComplete}
    >
      <div className="matrix-container">
        <div className="matrix-code"></div>
      </div>
      
      <motion.div 
        className="absolute z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.5 }}
      >
        <motion.h1 
          className="text-5xl font-orbitron text-cyan-400 tracking-widest"
          initial={{ filter: "blur(10px)" }}
          animate={{ filter: "blur(0px)" }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          M1SSION
        </motion.h1>
        
        <motion.p 
          className="text-yellow-400 text-center mt-4 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 0.8 }}
        >
          IT IS POSSIBLE
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

// Animation Option 2: Glitch Typography Effect
const GlitchAnimation = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, delay: 5 }}
      onAnimationComplete={onComplete}
    >
      <div className="glitch-container">
        <h1 className="glitch" data-text="M1SSION">M1SSION</h1>
        <div className="glitch-scanlines"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.8 }}
        className="mt-8"
      >
        <span className="text-yellow-400 text-xl tracking-[0.2em]">IT IS POSSIBLE</span>
      </motion.div>
    </motion.div>
  );
};

// Animation Option 3: Particle Explosion
const ParticleAnimation = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      className="fixed inset-0 bg-black flex items-center justify-center z-[9999] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, delay: 5 }}
      onAnimationComplete={onComplete}
    >
      <div className="particles-container">
        {Array.from({ length: 100 }).map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${50 + (Math.random() * 40 - 20)}%`,
              top: `${50 + (Math.random() * 40 - 20)}%`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: i % 3 === 0 ? "#00E5FF" : i % 3 === 1 ? "#FFDD00" : "#FFFFFF"
            }}
          ></div>
        ))}
      </div>
      
      <motion.div 
        className="text-center z-10 relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 1.2 }}
      >
        <motion.h1 
          className="text-6xl font-orbitron bg-gradient-to-r from-cyan-400 via-white to-cyan-400 bg-clip-text text-transparent"
          initial={{ letterSpacing: "0.2em" }}
          animate={{ letterSpacing: "0.3em" }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          M1SSION
        </motion.h1>
        
        <motion.p 
          className="text-yellow-400 mt-4 tracking-[0.15em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 0.8 }}
        >
          IT IS POSSIBLE
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

// Animation Option 4: Futuristic Scanner
const ScannerAnimation = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, delay: 5 }}
      onAnimationComplete={onComplete}
    >
      <div className="scanner-container">
        <div className="target-grid">
          <div className="target-square"></div>
        </div>
        <div className="scan-line"></div>
        
        <motion.div 
          className="scan-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <div className="typing-text">INITIALIZING MISSION...</div>
        </motion.div>
      </div>
      
      <motion.h1
        className="text-5xl font-orbitron text-white mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.8 }}
      >
        <span className="text-cyan-400">M1</span>SSION
      </motion.h1>
      
      <motion.p
        className="text-yellow-400 mt-4 tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.8, duration: 0.5 }}
      >
        IT IS POSSIBLE
      </motion.p>
    </motion.div>
  );
};

// Animation Option 5: 3D Logo Reveal
const ThreeDAnimation = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      className="fixed inset-0 bg-black flex items-center justify-center z-[9999]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, delay: 5 }}
      onAnimationComplete={onComplete}
    >
      <div className="perspective-container">
        <motion.div 
          className="cube"
          initial={{ rotateY: -180, rotateX: -45 }}
          animate={{ rotateY: 0, rotateX: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <div className="cube-face front">M1SSION</div>
          <div className="cube-face back"></div>
          <div className="cube-face right"></div>
          <div className="cube-face left"></div>
          <div className="cube-face top"></div>
          <div className="cube-face bottom"></div>
        </motion.div>
      </div>
      
      <motion.div
        className="absolute mt-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 0.8 }}
      >
        <p className="text-yellow-400 tracking-wider">IT IS POSSIBLE</p>
      </motion.div>
    </motion.div>
  );
};

// Animation options selector component
interface IntroAnimationOptionsProps {
  onComplete: () => void;
  selectedOption?: number;
}

const IntroAnimationOptions: React.FC<IntroAnimationOptionsProps> = ({ 
  onComplete,
  selectedOption = 1 // Default to first animation
}) => {
  // Select animation based on option
  switch (selectedOption) {
    case 1:
      return <MatrixAnimation onComplete={onComplete} />;
    case 2:
      return <GlitchAnimation onComplete={onComplete} />;
    case 3:
      return <ParticleAnimation onComplete={onComplete} />;
    case 4:
      return <ScannerAnimation onComplete={onComplete} />;
    case 5:
      return <ThreeDAnimation onComplete={onComplete} />;
    default:
      return <MatrixAnimation onComplete={onComplete} />;
  }
};

export default IntroAnimationOptions;
