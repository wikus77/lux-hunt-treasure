
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./intro-animation.css";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 8000); // Increased to 8 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <div className="relative h-48 w-48">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 2 }}
        >
          <div className="neon-n"></div>
          <motion.div 
            className="neon-i"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3, duration: 2 }}
          ></motion.div>
          <motion.div 
            className="neon-circle"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 5, duration: 2, type: "spring" }}
          ></motion.div>
        </motion.div>
        
        <motion.div
          className="absolute -bottom-16 left-0 right-0 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 6, duration: 2 }}
        >
          <h1 className="text-3xl font-light neon-text-blue">M1SSION</h1>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default IntroAnimation;
