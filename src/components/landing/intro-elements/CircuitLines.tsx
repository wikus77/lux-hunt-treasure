
import React from "react";
import { motion } from "framer-motion";

interface CircuitLinesProps {
  stage: number;
}

const CircuitLines: React.FC<CircuitLinesProps> = ({ stage }) => {
  if (stage < 2) return null;
  
  return (
    <>
      <motion.div 
        className="absolute h-[1px] bg-[#00E5FF]/30" 
        style={{ top: '20%', left: 0, width: '100%' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      />
      <motion.div 
        className="absolute w-[1px] bg-[#00E5FF]/30" 
        style={{ left: '30%', top: 0, height: '100%' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 2.4, duration: 0.8 }}
      />
      <motion.div 
        className="absolute h-[1px] bg-[#00E5FF]/30" 
        style={{ bottom: '30%', right: 0, width: '100%' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 2.6, duration: 0.8 }}
      />
    </>
  );
};

export default CircuitLines;
