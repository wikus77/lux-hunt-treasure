
import React from "react";
import { motion } from "framer-motion";

interface GravitationalRingsProps {
  stage: number;
}

const GravitationalRings: React.FC<GravitationalRingsProps> = ({ stage }) => {
  if (stage < 1) return null;
  
  return (
    <div className="gravitational-rings">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="gravity-ring"
          initial={{ 
            opacity: 0, 
            scale: 0.2,
          }}
          animate={{ 
            opacity: [0, 0.6, 0.3],
            scale: [0.2, 0.6 + (i * 0.3), 0.9 + (i * 0.4)],
            rotateZ: [0, i % 2 === 0 ? 45 : -45]
          }}
          transition={{ 
            duration: 2.5,
            times: [0, 0.6, 1],
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default GravitationalRings;
