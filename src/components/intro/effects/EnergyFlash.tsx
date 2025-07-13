
import React from "react";
import { motion } from "framer-motion";

interface EnergyFlashProps {
  stage: number;
}

const EnergyFlash: React.FC<EnergyFlashProps> = ({ stage }) => {
  if (stage < 3) return null;
  
  return (
    <motion.div
      className="energy-flash"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 0.9, 0.2], 
        scale: [0.2, 1.5, 2]
      }}
      transition={{ 
        duration: 1.5, 
        times: [0, 0.3, 1],
        ease: "easeOut"
      }}
    />
  );
};

export default EnergyFlash;
