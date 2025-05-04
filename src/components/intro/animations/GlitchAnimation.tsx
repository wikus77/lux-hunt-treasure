
import React from "react";
import { motion } from "framer-motion";
import "../styles/glitch-animation.css";
import "../styles/base-intro-styles.css";

interface AnimationProps {
  onComplete: () => void;
}

const GlitchAnimation: React.FC<AnimationProps> = ({ onComplete }) => {
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

export default GlitchAnimation;
