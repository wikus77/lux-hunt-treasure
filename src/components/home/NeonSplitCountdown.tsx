
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Calculate time remaining until the next month's first day
function getTimeRemaining(): TimeRemaining {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();

  const total = Math.max(diff, 0);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { days, hours, minutes, seconds };
}

// Function to check if countdown is complete
function isCountdownComplete(time: TimeRemaining): boolean {
  return time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;
}

export default function NeonSplitCountdown() {
  const [remainingTime, setRemainingTime] = useState<TimeRemaining>(getTimeRemaining());
  const [pulseTrigger, setPulseTrigger] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const prevSecondsRef = useRef(remainingTime.seconds);
  
  // Main countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = getTimeRemaining();
      setRemainingTime(newTime);
      
      if (isCountdownComplete(newTime) && !showFinalMessage) {
        setShowFinalMessage(true);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showFinalMessage]);
  
  // Pulse animation effect every 10 seconds
  useEffect(() => {
    const currentSeconds = remainingTime.seconds;
    if (currentSeconds % 10 === 0 && currentSeconds !== prevSecondsRef.current) {
      setPulseTrigger(true);
      setTimeout(() => setPulseTrigger(false), 1000);
    }
    prevSecondsRef.current = currentSeconds;
  }, [remainingTime.seconds]);

  // Time unit component with vertical slide animation
  const TimeUnit = ({ value, label }: { value: number; label: string }) => {
    const formattedValue = value.toString().padStart(2, "0");
    
    return (
      <div className="flex flex-col items-center">
        <div className="text-xs font-orbitron text-cyan-300/70 tracking-wider uppercase mb-1">
          {label}
        </div>
        
        <div 
          className={cn(
            "relative bg-black/60 backdrop-blur-md border rounded-lg w-20 h-24 md:w-28 md:h-32 flex items-center justify-center overflow-hidden",
            pulseTrigger ? "animate-neon-pulse" : "",
            showFinalMessage ? "border-yellow-400 animate-pulse" : "border-cyan-400"
          )}
          style={{
            boxShadow: pulseTrigger 
              ? "0 0 15px rgba(46, 196, 243, 0.8), 0 0 30px rgba(46, 196, 243, 0.4)"
              : "0 0 10px rgba(46, 196, 243, 0.5), 0 0 20px rgba(46, 196, 243, 0.2)"
          }}
        >
          {/* Light reflection effect */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-70"></div>
          
          <AnimatePresence mode="popLayout">
            <motion.div
              key={formattedValue}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "tween", duration: 0.3 }}
              className="font-orbitron text-4xl md:text-5xl font-bold text-cyan-300"
            >
              {formattedValue}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center w-full mt-8 relative z-10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.7, 0.2, 0.2, 1] }}
    >
      <h2 className="font-orbitron text-xl sm:text-2xl mb-4 text-center tracking-widest text-cyan-400">
        Tempo rimasto alla prossima missione!
      </h2>
      
      <div
        className={cn(
          "bg-black/70 px-6 py-8 rounded-3xl shadow-2xl",
          "flex gap-3 md:gap-8 justify-center items-center",
          "relative backdrop-blur-md border",
          pulseTrigger ? "border-cyan-400" : "border-cyan-800/50",
          showFinalMessage ? "border-yellow-400" : ""
        )}
        style={{
          boxShadow: showFinalMessage
            ? "0 8px 32px rgba(255, 215, 0, 0.3), 0 0 64px rgba(255, 215, 0, 0.2)"
            : "0 8px 32px rgba(46, 196, 243, 0.2), 0 0 64px rgba(46, 196, 243, 0.1)"
        }}
      >
        <TimeUnit value={remainingTime.days} label="giorni" />
        
        <div className="text-3xl md:text-4xl font-orbitron text-cyan-500 animate-pulse">:</div>
        
        <TimeUnit value={remainingTime.hours} label="ore" />
        
        <div className="text-3xl md:text-4xl font-orbitron text-cyan-500 animate-pulse">:</div>
        
        <TimeUnit value={remainingTime.minutes} label="minuti" />
        
        <div className="text-3xl md:text-4xl font-orbitron text-cyan-500 animate-pulse">:</div>
        
        <TimeUnit value={remainingTime.seconds} label="secondi" />
        
        {/* Final message overlay */}
        <AnimatePresence>
          {showFinalMessage && (
            <motion.div 
              className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              <motion.img
                src="/lovable-uploads/b349206f-bdf7-42e2-a1a6-b87988bc94f4.png" 
                alt="M1SSION Logo"
                className="w-48 h-auto mb-6" 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              />
              
              <motion.div
                className="text-2xl md:text-4xl font-orbitron tracking-wider text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  textShadow: [
                    "0 0 5px rgba(255,255,255,0.5), 0 0 10px rgba(255,255,255,0.3)",
                    "0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.5)",
                    "0 0 5px rgba(255,255,255,0.5), 0 0 10px rgba(255,255,255,0.3)"
                  ]
                }}
                transition={{ 
                  delay: 1.2, 
                  duration: 2,
                  textShadow: { repeat: Infinity, duration: 3 }
                }}
              >
                IT IS POSSIBLE
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
