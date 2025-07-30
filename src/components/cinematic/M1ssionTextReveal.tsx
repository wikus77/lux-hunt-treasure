// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from "react";
import { motion } from "framer-motion";

interface M1ssionTextRevealProps {
  onTextClick: () => void;
}

const M1ssionTextReveal: React.FC<M1ssionTextRevealProps> = ({ onTextClick }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* M1SSION Text */}
      <motion.div
        className="text-6xl md:text-8xl font-bold cursor-pointer mb-4"
        onClick={onTextClick}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0, 1],
          scale: [0, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          times: [0, 0.8, 1],
          ease: "easeOut"
        }}
        whileHover={{ 
          scale: 1.05,
          textShadow: "0 0 30px rgba(0,229,255,0.8)"
        }}
        style={{
          textShadow: "0 0 20px rgba(0,229,255,0.5)",
          filter: "drop-shadow(0 0 10px rgba(0,229,255,0.3))"
        }}
      >
        <span style={{ color: "#00E5FF" }}>M1</span>
        <span style={{ color: "white" }}>SSION</span>
        <span className="text-xs align-top" style={{ color: "white" }}>™</span>
      </motion.div>

      {/* Mission Starts Here */}
      <motion.div
        className="text-xl md:text-2xl text-white cursor-pointer"
        onClick={onTextClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: [0, 1],
          y: [20, 0]
        }}
        transition={{ 
          duration: 1.5,
          delay: 1.5,
          ease: "easeOut"
        }}
        whileHover={{ 
          scale: 1.05,
          color: "#00E5FF"
        }}
        style={{
          textShadow: "0 0 10px rgba(255,255,255,0.5)"
        }}
      >
        Mission Starts Here
      </motion.div>

      {/* Glow effects */}
      <motion.div
        className="absolute w-full h-full"
        style={{
          background: "radial-gradient(circle at center, rgba(0,229,255,0.1) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.7] }}
        transition={{ 
          duration: 3,
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    </div>
  );
};

export default M1ssionTextReveal;