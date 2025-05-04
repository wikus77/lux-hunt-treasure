
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CircuitLinesProps {
  stage: number;
}

const CircuitLines: React.FC<CircuitLinesProps> = ({ stage }) => {
  return (
    <AnimatePresence>
      {stage >= 2 && (
        <motion.div
          className="absolute inset-0 z-5 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Corner lights that appear at the edges */}
          <motion.div 
            className="absolute top-0 left-0 w-16 h-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0.3] }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute top-0 left-0 w-12 h-[1px] bg-white/40" />
            <div className="absolute top-0 left-0 w-[1px] h-12 bg-white/40" />
          </motion.div>
          
          <motion.div 
            className="absolute top-0 right-0 w-16 h-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0.3] }}
            transition={{ duration: 1.5, delay: 0.2 }}
          >
            <div className="absolute top-0 right-0 w-12 h-[1px] bg-white/40" />
            <div className="absolute top-0 right-0 w-[1px] h-12 bg-white/40" />
          </motion.div>
          
          <motion.div 
            className="absolute bottom-0 left-0 w-16 h-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0.3] }}
            transition={{ duration: 1.5, delay: 0.4 }}
          >
            <div className="absolute bottom-0 left-0 w-12 h-[1px] bg-white/40" />
            <div className="absolute bottom-0 left-0 w-[1px] h-12 bg-white/40" />
          </motion.div>
          
          <motion.div 
            className="absolute bottom-0 right-0 w-16 h-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0.3] }}
            transition={{ duration: 1.5, delay: 0.6 }}
          >
            <div className="absolute bottom-0 right-0 w-12 h-[1px] bg-white/40" />
            <div className="absolute bottom-0 right-0 w-[1px] h-12 bg-white/40" />
          </motion.div>
          
          {/* Subtle circuit pattern */}
          {[...Array(6)].map((_, i) => {
            const isEven = i % 2 === 0;
            const position = (i + 1) * 15;
            
            return (
              <React.Fragment key={i}>
                <motion.div 
                  className="absolute h-[1px] bg-white/20"
                  style={{
                    top: `${isEven ? position : 100 - position}%`,
                    left: isEven ? "5%" : "auto",
                    right: !isEven ? "5%" : "auto",
                    width: "30%"
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ 
                    duration: 1,
                    delay: 0.3 + i * 0.1
                  }}
                />
              </React.Fragment>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CircuitLines;
