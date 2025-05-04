
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ElectricalCrackleProps {
  stage: number;
}

const ElectricalCrackle: React.FC<ElectricalCrackleProps> = ({ stage }) => {
  return (
    <AnimatePresence>
      {stage >= 1 && (
        <motion.div 
          className="absolute inset-0 z-10 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Horizontal electrical discharge */}
          <motion.div
            className="absolute top-1/2 left-0 h-[3px] bg-white w-full transform -translate-y-1/2"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ 
              scaleX: 1, 
              opacity: [0, 0.8, 0],
              filter: ["brightness(1)", "brightness(1.8)", "brightness(1)"]
            }}
            transition={{
              duration: 0.7,
              ease: "easeInOut",
            }}
          />
          
          {/* Secondary smaller discharges */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-[1px] bg-blue-100 w-full"
              style={{
                top: `${30 + i * 10}%`,
                left: 0,
                opacity: 0.7,
              }}
              initial={{ scaleX: 0, x: "100%" }}
              animate={{ 
                scaleX: [0, 1, 0], 
                x: ["100%", "0%", "-100%"],
                opacity: [0, 0.6, 0] 
              }}
              transition={{
                duration: 0.5,
                delay: 0.1 + i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Glitch overlay effect */}
          {stage >= 1 && stage < 3 && (
            <motion.div
              className="absolute inset-0 bg-black opacity-70 mix-blend-overlay"
              animate={{
                opacity: [0.7, 0.4, 0.7, 0.5],
                background: [
                  "rgba(0,0,0,0.7)",
                  "rgba(30,30,50,0.5)",
                  "rgba(0,0,0,0.7)",
                ]
              }}
              transition={{
                duration: 2,
                repeat: 3,
                repeatType: "reverse"
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ElectricalCrackle;
