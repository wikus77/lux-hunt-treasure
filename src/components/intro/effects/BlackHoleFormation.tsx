
import React from "react";
import { motion } from "framer-motion";

interface BlackHoleFormationProps {
  stage: number;
}

const BlackHoleFormation: React.FC<BlackHoleFormationProps> = ({ stage }) => {
  if (stage < 2) return null;
  
  return (
    <div className="black-hole-formation">
      <motion.div
        className="accretion-disk"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: stage >= 3 ? 0 : 0.8,
          scale: stage >= 3 ? 0.1 : 1
        }}
        transition={{ 
          duration: stage >= 3 ? 1.5 : 2,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="event-horizon"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: stage >= 3 ? 0 : 1,
          scale: stage >= 3 ? 0 : 0.8
        }}
        transition={{ 
          duration: stage >= 3 ? 1.5 : 2,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default BlackHoleFormation;
