import React from 'react';
import { motion } from 'framer-motion';

interface IntroOverlayProps {
  onComplete: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onAnimationComplete={onComplete}
    >
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center"
      >
        <motion.h1
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-6xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600"
        >
          M1SSION™
        </motion.h1>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="h-1 bg-gradient-to-r from-cyan-400 to-blue-600 mt-4 mx-auto"
        />
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="text-gray-400 mt-4 text-lg"
        >
          PRIZE HUNT URBAN
        </motion.p>
      </motion.div>

      {/* Particles Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={{ 
              y: [null, -20, 20, -10, 0],
              opacity: [0, 1, 0.8, 0.3, 0]
            }}
            transition={{
              duration: 3,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
};