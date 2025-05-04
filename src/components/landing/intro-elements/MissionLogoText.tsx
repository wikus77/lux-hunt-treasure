
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MissionLogoTextProps {
  stage: number;
}

const MissionLogoText: React.FC<MissionLogoTextProps> = ({ stage }) => {
  return (
    <AnimatePresence>
      {stage >= 3 && (
        <motion.div 
          className="absolute inset-0 z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Central light surge */}
          <motion.div
            className="absolute w-full h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.5] }}
            transition={{ duration: 1.5 }}
          >
            <div 
              className="w-[300px] h-[300px] rounded-full" 
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
                filter: "blur(20px)"
              }}
            />
          </motion.div>
          
          {/* M1SSION logo with metallic effect */}
          <motion.h1
            className="text-5xl sm:text-7xl font-bold font-orbitron relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #A0A0A0 50%, #787878 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
              letterSpacing: "0.05em",
              filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))"
            }}
          >
            M1SSION
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MissionLogoText;
