
import React from "react";
import { motion } from "framer-motion";
import "../styles/matrix-animation.css";
import "../styles/base-intro-styles.css";

interface AnimationProps {
  onComplete: () => void;
}

const MatrixAnimation: React.FC<AnimationProps> = ({ onComplete }) => {
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

export default MatrixAnimation;
