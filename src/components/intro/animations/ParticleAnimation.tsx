
import React from "react";
import { motion } from "framer-motion";
import "../styles/particle-animation.css";
import "../styles/base-intro-styles.css";

interface AnimationProps {
  onComplete: () => void;
}

const ParticleAnimation: React.FC<AnimationProps> = ({ onComplete }) => {
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

export default ParticleAnimation;
