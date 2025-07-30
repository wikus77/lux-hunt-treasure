// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from "react";
import { motion } from "framer-motion";

interface BlackHoleRevealProps {
  onComplete: () => void;
}

const BlackHoleReveal: React.FC<BlackHoleRevealProps> = ({ onComplete }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Event Horizon - CSS Only */}
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: "radial-gradient(circle, transparent 30%, rgba(0,0,0,0.9) 35%, black 40%)",
          boxShadow: "0 0 100px rgba(0,229,255,0.3), inset 0 0 50px rgba(0,229,255,0.2)"
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 1],
          opacity: [0, 1, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 3,
          times: [0, 0.6, 1],
          ease: "easeOut"
        }}
      />

      {/* Accretion Disk - CSS Only */}
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, transparent, rgba(0,229,255,0.4), transparent, rgba(138,43,226,0.4), transparent)",
          border: "4px solid transparent",
          backgroundClip: "padding-box"
        }}
        initial={{ scale: 0, opacity: 0, rotate: 0 }}
        animate={{ 
          scale: [0, 1],
          opacity: [0, 0.8],
          rotate: [0, 360]
        }}
        transition={{ 
          duration: 4,
          ease: "linear",
          rotate: {
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }
        }}
        onAnimationComplete={onComplete}
      />

      {/* Gravitational Lensing Effect - CSS Only */}
      <motion.div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background: "radial-gradient(circle, transparent 60%, rgba(255,255,255,0.1) 65%, transparent 70%)",
          filter: "blur(2px)"
        }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1] }}
        transition={{ duration: 2, delay: 1 }}
      />
    </div>
  );
};

export default BlackHoleReveal;