
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LogoRevealProps {
  stage: number;
}

const LogoReveal: React.FC<LogoRevealProps> = ({ stage }) => {
  return (
    <div className="logo-container">
      {/* M1 part */}
      <AnimatePresence>
        {stage >= 4 && (
          <motion.div
            className="logo-part m1-part"
            initial={{ opacity: 0, filter: "blur(20px)" }}
            animate={{ 
              opacity: 1, 
              filter: "blur(0px)",
              y: stage >= 6 ? [0, 10] : 0,
              scale: stage >= 6 ? [1, 0.95] : 1,
            }}
            transition={{ 
              duration: stage >= 6 ? 1.5 : 1.2, 
              delay: stage >= 5 ? 0 : 0.2 
            }}
          >
            <span className="text-cyan-400">M1</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* SSION part */}
      <AnimatePresence>
        {stage >= 4 && (
          <motion.div
            className="logo-part ssion-part"
            initial={{ opacity: 0, filter: "blur(20px)" }}
            animate={{ 
              opacity: 1, 
              filter: "blur(0px)",
              y: stage >= 6 ? [0, 10] : 0,
              scale: stage >= 6 ? [1, 0.95] : 1,
            }}
            transition={{ 
              duration: stage >= 6 ? 1.5 : 1.2, 
              delay: stage >= 5 ? 0.1 : 0.8 
            }}
          >
            SSION
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced glow effect */}
      {stage >= 4 && (
        <motion.div 
          className="logo-glow"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: stage >= 6 ? [0.8, 0] : [0, 0.8],
            scale: stage >= 6 ? [1, 1.2] : [0.8, 1]
          }}
          transition={{ 
            duration: stage >= 6 ? 1.5 : 1.2
          }}
        />
      )}
    </div>
  );
};

export default LogoReveal;
