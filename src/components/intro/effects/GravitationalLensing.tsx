
import React from "react";
import { motion } from "framer-motion";

interface GravitationalLensingProps {
  stage: number;
}

const GravitationalLensing: React.FC<GravitationalLensingProps> = ({ stage }) => {
  if (stage !== 2 && stage !== 3) return null;
  
  return (
    <div className="gravitational-lensing">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={`lens-${i}`}
          className="lens-streak"
          initial={{ 
            opacity: 0,
            rotate: (i * 15) % 360,
            scaleX: 0
          }}
          animate={{ 
            opacity: [0, 0.7, 0],
            scaleX: [0, 1, 0]
          }}
          transition={{ 
            duration: 2,
            delay: Math.random() * 0.5,
            repeatType: "loop",
            repeat: 1
          }}
          style={{
            rotate: `${i * 15}deg`,
          }}
        />
      ))}
    </div>
  );
};

export default GravitationalLensing;
