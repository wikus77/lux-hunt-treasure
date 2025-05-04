
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SloganTextProps {
  stage: number;
}

const SloganText: React.FC<SloganTextProps> = ({ stage }) => {
  return (
    <AnimatePresence>
      {stage >= 4 && (
        <motion.div 
          className="absolute inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute mt-28 sm:mt-32"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1, 
              delay: 0.3,
              ease: [0.23, 1.0, 0.32, 1.0] // Cubic bezier for smooth fade in
            }}
          >
            <div 
              className="text-xl sm:text-2xl tracking-[0.25em] font-orbitron font-bold"
              style={{
                color: "#FFD700",
                textShadow: "0px 0px 10px rgba(255, 215, 0, 0.7)"
              }}
            >
              IT IS POSSIBLE
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SloganText;
