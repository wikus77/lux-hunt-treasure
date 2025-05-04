
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [stage, setStage] = useState<number>(0);
  const { play, stop } = useAudio("/sounds/portal-open.mp3", { volume: 0.7 });
  
  // Progress through animation stages
  useEffect(() => {
    // Initial delay before portal opens
    const timer1 = setTimeout(() => {
      setStage(1); // Open portal
      play();
    }, 1000);
    
    // Logo appears
    const timer2 = setTimeout(() => {
      setStage(2); // Show logo
    }, 3000);
    
    // Slogan appears
    const timer3 = setTimeout(() => {
      setStage(3); // Show slogan
    }, 6000);
    
    // Complete animation
    const timer4 = setTimeout(() => {
      stop();
      onComplete();
    }, 9000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      stop();
    };
  }, [onComplete, play, stop]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5 } }}
    >
      {/* Digital void particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: i % 3 === 0 ? '#00E5FF' : '#ffffff',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.5,
              filter: "blur(1px)"
            }}
            animate={{
              y: [0, -10, 0, 10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 8 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Portal animation */}
      <div className="relative flex items-center justify-center">
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div
              className="absolute z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.3, 1], 
                opacity: 1,
                boxShadow: [
                  "0 0 0px 0px rgba(255, 255, 255, 0)",
                  "0 0 100px 30px rgba(255, 255, 255, 0.8)",
                  "0 0 50px 20px rgba(255, 255, 255, 0.4)"
                ]
              }}
              transition={{ duration: 2, times: [0, 0.7, 1] }}
            >
              <div className="w-[320px] h-[320px] rounded-full flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00E5FF]/40 via-white to-[#00E5FF]/40 animate-spin-slow opacity-80" />
                <div className="absolute inset-2 rounded-full bg-black" />
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-black opacity-50" />
                  
                  {/* Energy particles */}
                  {stage >= 1 && [...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full bg-[#00E5FF]"
                      style={{
                        width: `${Math.random() * 8 + 2}px`,
                        height: `${Math.random() * 8 + 2}px`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        filter: "blur(1px)"
                      }}
                      animate={{
                        x: [0, Math.random() * 40 - 20],
                        y: [0, Math.random() * 40 - 20],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: Math.random() * 3 + 1,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Logo animation */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              className="relative z-20 text-center"
              initial={{ scale: 0.7, opacity: 0, z: -100 }}
              animate={{ scale: 1, opacity: 1, z: 0 }}
              transition={{ 
                duration: 2,
                type: "spring",
                stiffness: 50,
                damping: 15
              }}
            >
              <motion.h1 
                className="text-6xl md:text-7xl font-orbitron font-bold tracking-wide"
                animate={{ 
                  textShadow: ["0 0 10px rgba(255,255,255,0.5)", "0 0 30px rgba(255,255,255,0.2)", "0 0 15px rgba(0,229,255,0.5)"]
                }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              >
                <span className="text-[#00E5FF]">M1</span>
                <span className="text-white">SSION</span>
              </motion.h1>
              
              {/* Slogan animation */}
              <AnimatePresence>
                {stage >= 3 && (
                  <motion.div
                    className="mt-8 text-yellow-400 text-lg tracking-[0.2em]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                  >
                    <motion.p
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      IT IS POSSIBLE
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CinematicIntro;
