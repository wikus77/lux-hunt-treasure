
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
          opacity: stage >= 3 ? [0.8, 1, 0] : [0, 0.8, 0.6],
          scale: stage >= 3 ? [1, 1.2, 0.1] : [0, 1, 1]
        }}
        transition={{ 
          duration: stage >= 3 ? 1.5 : 2,
          times: stage >= 3 ? [0, 0.4, 1] : [0, 0.5, 1]
        }}
      />
      
      <motion.div
        className="event-horizon"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: stage >= 3 ? [1, 0.5, 0] : [0, 1, 0.8],
          scale: stage >= 3 ? [0.8, 0.5, 0] : [0, 0.8, 0.7]
        }}
        transition={{ 
          duration: stage >= 3 ? 1.5 : 2,
          times: stage >= 3 ? [0, 0.4, 1] : [0, 0.5, 1]
        }}
      />
    </div>
  );
};

export default BlackHoleFormation;
