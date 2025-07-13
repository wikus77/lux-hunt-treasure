
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
        opacity: 0.2, 
        scale: 2
      }}
      transition={{ 
        duration: 1.8,
        ease: "easeOut"
      }}
    />
  );
};

export default EnergyFlash;
