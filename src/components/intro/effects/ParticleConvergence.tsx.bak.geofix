
import React from "react";
import { motion } from "framer-motion";

interface ParticleConvergenceProps {
  stage: number;
}

const ParticleConvergence: React.FC<ParticleConvergenceProps> = ({ stage }) => {
  if (stage < 4) return null;
  
  return (
    <div className="particle-convergence">
      {Array.from({ length: 80 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="converging-particle"
          initial={{ 
            x: `${Math.random() * 200 - 100}%`, 
            y: `${Math.random() * 200 - 100}%`,
            opacity: 0,
            scale: 0
          }}
          animate={{ 
            x: 0,
            y: 0,
            opacity: [0, 0.8, 0],
            scale: [0, 0.8, 0]
          }}
          transition={{ 
            duration: 2 + Math.random() * 1,
            delay: Math.random() * 0.5,
            ease: "easeInOut",
            times: [0, 0.7, 1]
          }}
          style={{
            backgroundColor: i % 5 === 0 ? "#00BFFF" : 
                          i % 5 === 1 ? "#FFFFFF" : 
                          i % 5 === 2 ? "#87CEFA" :
                          i % 5 === 3 ? "#E0FFFF" : "#AAAAAA",
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            borderRadius: "50%"
          }}
        />
      ))}
    </div>
  );
};

export default ParticleConvergence;
