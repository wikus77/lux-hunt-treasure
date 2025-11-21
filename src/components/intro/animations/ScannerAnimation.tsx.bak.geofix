
import React from "react";
import { motion } from "framer-motion";
import "../styles/scanner-animation.css";
import "../styles/base-intro-styles.css";

interface AnimationProps {
  onComplete: () => void;
}

const ScannerAnimation: React.FC<AnimationProps> = ({ onComplete }) => {
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

export default ScannerAnimation;
