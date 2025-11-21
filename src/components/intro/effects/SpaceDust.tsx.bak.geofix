
import React from "react";
import { motion } from "framer-motion";

const SpaceDust: React.FC = () => {
  return (
    <>
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          className="space-dust"
          initial={{ 
            x: `${Math.random() * 100}%`, 
            y: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5,
            scale: Math.random() * 0.8 + 0.2
          }}
          animate={{ 
            opacity: [
              Math.random() * 0.3, 
              Math.random() * 0.6, 
              Math.random() * 0.3
            ],
            scale: [
              Math.random() * 0.8 + 0.2,
              Math.random() * 0.9 + 0.5,
              Math.random() * 0.8 + 0.2
            ]
          }}
          transition={{ 
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            background: i % 3 === 0 ? "#00BFFF" : i % 3 === 1 ? "#FFFFFF" : "#AAAAAA",
            borderRadius: "50%"
          }}
        />
      ))}
    </>
  );
};

export default SpaceDust;
