
import React from "react";
import { motion } from "framer-motion";
import "../styles/3d-animation.css";
import "../styles/base-intro-styles.css";

interface AnimationProps {
  onComplete: () => void;
}

const ThreeDAnimation: React.FC<AnimationProps> = ({ onComplete }) => {
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

export default ThreeDAnimation;
