
import React from "react";
import { motion } from "framer-motion";

interface SystemLightUpProps {
  stage: number;
}

const SystemLightUp: React.FC<SystemLightUpProps> = ({ stage }) => {
  if (stage < 2) return null;
  
  return (
    <motion.div className="absolute inset-0">
      {/* Server/system squares lighting up */}
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={`system-${i}`}
          className="absolute bg-white/5 border border-white/10"
          style={{
            width: `${Math.random() * 15 + 5}%`,
            height: `${Math.random() * 15 + 5}%`,
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
          }}
          initial={{ opacity: 0, boxShadow: 'none' }}
          animate={{ 
            opacity: 1, 
            boxShadow: ['0 0 0px rgba(0, 229, 255, 0)', '0 0 15px rgba(0, 229, 255, 0.7)', '0 0 5px rgba(0, 229, 255, 0.3)']
          }}
          transition={{ 
            delay: i * 0.15, 
            duration: 0.6, 
            boxShadow: { times: [0, 0.5, 1] }
          }}
        />
      ))}
    </motion.div>
  );
};

export default SystemLightUp;
