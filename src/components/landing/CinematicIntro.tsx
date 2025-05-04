
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";
import "../landing/glitch-intro.css";

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [stage, setStage] = useState<number>(0);
  const { play, stop } = useAudio("/sounds/portal-open.mp3", { volume: 0.7 });
  
  // Progress through animation stages
  useEffect(() => {
    // Initial black screen with electrical crackle
    const timer1 = setTimeout(() => {
      setStage(1); // Start glitchy lines and code fragments
      play();
    }, 800);
    
    // Systems power up - sections light up
    const timer2 = setTimeout(() => {
      setStage(2); // Show more elements powering up
    }, 2500);
    
    // Energy surge and logo appears
    const timer3 = setTimeout(() => {
      setStage(3); // Show logo with energy pulse
    }, 4000);
    
    // Slogan appears for transition
    const timer4 = setTimeout(() => {
      setStage(4); // Show slogan
    }, 5500);
    
    // Complete animation
    const timer5 = setTimeout(() => {
      stop();
      onComplete();
    }, 7000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      stop();
    };
  }, [onComplete, play, stop]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5 } }}
    >
      {/* Electrical crackle visual effect */}
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Glitchy horizontal lines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`h-line-${i}`}
                className="absolute bg-white/70"
                style={{
                  height: `${Math.random() * 1 + 0.5}px`,
                  width: '100%',
                  top: `${(i * 100) / 10}%`,
                  left: 0,
                  opacity: 0.5
                }}
                animate={{
                  opacity: [0, 1, 0],
                  width: ['0%', '100%', '0%'],
                  left: ['0%', '0%', '100%'],
                }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                  repeat: 3,
                  repeatType: 'loop'
                }}
              />
            ))}
            
            {/* Code fragments & glitch elements */}
            {stage >= 1 && Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`code-frag-${i}`}
                className="absolute text-white/80 text-xs font-mono"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0,
                  textShadow: '0 0 5px rgba(0, 229, 255, 0.7)'
                }}
                animate={{
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 1.2,
                  delay: 1 + Math.random() * 1.5,
                  repeat: Math.floor(Math.random() * 2),
                }}
              >
                {['01', '10', 'M1', ':::', '>', '//', '[]', '{}', 'SYS'][Math.floor(Math.random() * 9)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* System sections lighting up */}
      <AnimatePresence>
        {stage >= 2 && (
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
        )}
      </AnimatePresence>
      
      {/* New Glitch Effect */}
      <AnimatePresence>
        {stage >= 3 && (
          <div id="intro" className="z-10">
            <div className="glitch">M1SSION</div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Slogan appearance */}
      <AnimatePresence>
        {stage >= 4 && (
          <motion.div
            className="mt-20 text-yellow-400 text-lg tracking-[0.2em] relative z-10"
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
      
      {/* Circuit-like thin lines across screen */}
      <div className="absolute inset-0 pointer-events-none">
        {stage >= 2 && (
          <>
            <motion.div 
              className="absolute h-[1px] bg-[#00E5FF]/30" 
              style={{ top: '20%', left: 0, width: '100%' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2.2, duration: 0.8 }}
            />
            <motion.div 
              className="absolute w-[1px] bg-[#00E5FF]/30" 
              style={{ left: '30%', top: 0, height: '100%' }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 2.4, duration: 0.8 }}
            />
            <motion.div 
              className="absolute h-[1px] bg-[#00E5FF]/30" 
              style={{ bottom: '30%', right: 0, width: '100%' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2.6, duration: 0.8 }}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

export default CinematicIntro;
