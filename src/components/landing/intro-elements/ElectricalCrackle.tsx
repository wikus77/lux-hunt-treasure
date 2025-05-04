
import React from "react";
import { motion } from "framer-motion";

interface ElectricalCrackleProps {
  stage: number;
}

const ElectricalCrackle: React.FC<ElectricalCrackleProps> = ({ stage }) => {
  if (stage < 1) return null;
  
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glitchy horizontal lines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={`h-line-${i}`}
          className="absolute bg-white/70"
          style={{
            height: `${Math.random() * 1 + 0.5}px`,
            width: '100%',
            top: `${(i * 100) / 10}%`,
            left: 0,
            opacity: 0.5
          }}
          animate={{
            opacity: [0, 1, 0],
            width: ['0%', '100%', '0%'],
            left: ['0%', '0%', '100%'],
          }}
          transition={{
            duration: 0.7,
            delay: i * 0.08,
            repeat: 3,
            repeatType: 'loop'
          }}
        />
      ))}
      
      {/* Code fragments & glitch elements */}
      {stage >= 1 && Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`code-frag-${i}`}
          className="absolute text-white/80 text-xs font-mono"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0,
            textShadow: '0 0 5px rgba(0, 229, 255, 0.7)'
          }}
          animate={{
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 1.2,
            delay: 1 + Math.random() * 1.5,
            repeat: Math.floor(Math.random() * 2),
          }}
        >
          {['01', '10', 'M1', ':::', '>', '//', '[]', '{}', 'SYS'][Math.floor(Math.random() * 9)]}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ElectricalCrackle;
