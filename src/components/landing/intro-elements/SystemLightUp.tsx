
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SystemLightUpProps {
  stage: number;
}

const SystemLightUp: React.FC<SystemLightUpProps> = ({ stage }) => {
  return (
    <AnimatePresence>
      {stage >= 2 && (
        <motion.div 
          className="absolute inset-0 z-20 overflow-hidden flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Binary code fragments that appear and disappear */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => {
              const top = Math.random() * 100;
              const left = Math.random() * 100;
              const binaryText = [...Array(8)].map(() => Math.round(Math.random())).join('');
              
              return (
                <motion.div
                  key={i}
                  className="absolute text-[#00ff00] text-xs opacity-50 font-mono"
                  style={{ top: `${top}%`, left: `${left}%` }}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.7, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.15,
                    repeat: 1,
                    repeatType: "reverse"
                  }}
                >
                  {binaryText}
                </motion.div>
              );
            })}
          </div>
          
          {/* Central glowing effect that grows */}
          {stage >= 2 && (
            <motion.div
              className="absolute"
              initial={{ 
                width: 0,
                height: 0,
                opacity: 0, 
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)"
              }}
              animate={{ 
                width: ["0px", "300px", "500px"], 
                height: ["0px", "300px", "500px"],
                opacity: [0, 0.8, 0.3] 
              }}
              transition={{
                duration: 2.5,
                ease: "easeOut"
              }}
            />
          )}
          
          {/* Glitch lines */}
          {stage >= 2 && stage < 4 && [...Array(8)].map((_, i) => (
            <motion.div
              key={`glitch-${i}`}
              className="absolute w-full h-[2px] bg-white/40"
              style={{ top: `${Math.random() * 100}%` }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0],
                scaleX: [0, 1, 0],
                x: ["-50%", "0%", "50%"]
              }}
              transition={{
                duration: 0.2,
                delay: 0.1 + i * 0.3,
                repeat: 2,
                repeatType: "loop"
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SystemLightUp;
