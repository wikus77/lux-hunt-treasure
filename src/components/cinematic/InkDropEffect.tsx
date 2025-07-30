// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from "react";
import { motion } from "framer-motion";

interface InkDropEffectProps {
  onComplete: () => void;
}

const InkDropEffect: React.FC<InkDropEffectProps> = ({ onComplete }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Initial ink drop */}
      <motion.div
        className="absolute w-4 h-4 bg-black rounded-full"
        initial={{ scale: 0, y: -200 }}
        animate={{ 
          scale: [0, 1, 1],
          y: [-200, 0, 0]
        }}
        transition={{ 
          duration: 0.8,
          times: [0, 0.7, 1],
          ease: "easeIn"
        }}
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />

      {/* Ripple effects expanding outward */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute border-2 border-black rounded-full"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 10 + i * 5, 20 + i * 10],
            opacity: [0, 0.8, 0]
          }}
          transition={{ 
            duration: 2 + i * 0.3,
            delay: 0.8 + i * 0.2,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Dark overlay that spreads from center */}
      <motion.div
        className="absolute inset-0 bg-black"
        style={{
          clipPath: "circle(0% at center)",
        }}
        initial={{ clipPath: "circle(0% at center)" }}
        animate={{ clipPath: "circle(150% at center)" }}
        transition={{ 
          duration: 2.5,
          delay: 1.5,
          ease: "easeInOut"
        }}
        onAnimationComplete={onComplete}
      />
    </div>
  );
};

export default InkDropEffect;