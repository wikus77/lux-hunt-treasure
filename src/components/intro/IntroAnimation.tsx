
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
    }, 5000); // 5 secondi di durata dell'intro

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <div className="relative h-48 w-48">
        {/* Logo N e 1 neon animati */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="neon-n"></div>
          <motion.div 
            className="neon-i"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          ></motion.div>
          <motion.div 
            className="neon-circle"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.8, type: "spring" }}
          ></motion.div>
        </motion.div>
        
        {/* Testo M1SSION con effetto neon */}
        <motion.div
          className="absolute -bottom-16 left-0 right-0 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <h1 className="text-3xl font-extrabold neon-text-blue">M1SSION</h1>
        </motion.div>
        
        {/* Linee decorative orizzontali */}
        <motion.div 
          className="absolute top-1/2 -left-32 w-32 h-[2px] neon-line-horizontal"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 -right-32 w-32 h-[2px] neon-line-horizontal"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        ></motion.div>
        
        {/* Particelle di sfondo */}
        <div className="particles-container">
          {Array.from({ length: 20 }).map((_, index) => (
            <div 
              key={index} 
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${3 + Math.random() * 5}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default IntroAnimation;
