
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
  const minutes = Math.floor((total / 1000 / 60) % 60);
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
  const prevMinutesRef = useRef(remainingTime.minutes);
  
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
  
  // Enhanced pulse animation effect every 10 seconds
  useEffect(() => {
    const currentSeconds = remainingTime.seconds;
    if (currentSeconds % 10 === 0 && currentSeconds !== prevSecondsRef.current) {
      setPulseTrigger(true);
      setTimeout(() => setPulseTrigger(false), 1200);
    }
    prevSecondsRef.current = currentSeconds;
    
    // Additional pulse for minute change
    if (remainingTime.minutes !== prevMinutesRef.current) {
      setPulseTrigger(true);
      setTimeout(() => setPulseTrigger(false), 1200);
    }
    prevMinutesRef.current = remainingTime.minutes;
  }, [remainingTime.seconds, remainingTime.minutes]);

  // Enhanced time unit component with vertical slide animation
  const TimeUnit = ({ value, label }: { value: number; label: string }) => {
    const formattedValue = value.toString().padStart(2, "0");
    
    return (
      <div className="flex flex-col items-center mx-1 md:mx-2">
        <div className="text-xs md:text-sm font-orbitron text-cyan-300/70 tracking-wider uppercase mb-1 select-none">
          {label}
        </div>
        
        <div 
          className={cn(
            "relative bg-black/50 backdrop-blur-lg border rounded-lg w-16 h-20 sm:w-20 sm:h-24 md:w-28 md:h-32 flex items-center justify-center overflow-hidden",
            pulseTrigger ? "animate-neon-pulse" : "",
            showFinalMessage ? "border-yellow-400" : "border-cyan-400/80"
          )}
          style={{
            boxShadow: pulseTrigger 
              ? "0 0 20px rgba(46, 196, 243, 0.9), 0 0 35px rgba(46, 196, 243, 0.6)"
              : "0 0 12px rgba(46, 196, 243, 0.6), 0 0 25px rgba(46, 196, 243, 0.3)"
          }}
        >
          {/* Enhanced light reflection effect */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-90"></div>
          <div className="absolute top-[2px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          {/* Moving light effect */}
          <div className="absolute top-0 -left-20 w-20 h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-line-move"></div>
          
          <AnimatePresence mode="popLayout">
            <motion.div
              key={formattedValue}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-300 select-none"
              style={{
                textShadow: "0 0 8px rgba(0, 229, 255, 0.8), 0 0 12px rgba(0, 229, 255, 0.4)"
              }}
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
      className="flex flex-col items-center justify-center w-full mt-8 mb-12 relative z-10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.7, 0.2, 0.2, 1] }}
    >
      <h2 
        className="font-orbitron text-xl sm:text-2xl mb-6 text-center tracking-widest select-none"
        style={{
          background: "linear-gradient(to right, #00e5ff, #2ec4f3)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 10px rgba(46, 196, 243, 0.5)"
        }}
      >
        Tempo rimasto alla prossima missione
      </h2>
      
      <div
        className={cn(
          "bg-black/70 px-4 py-8 rounded-3xl shadow-2xl",
          "flex gap-2 md:gap-6 justify-center items-center",
          "relative backdrop-blur-xl border",
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
        
        <div className="text-2xl md:text-4xl font-orbitron text-cyan-500 animate-pulse">:</div>
        
        <TimeUnit value={remainingTime.hours} label="ore" />
        
        <div className="text-2xl md:text-4xl font-orbitron text-cyan-500 animate-pulse">:</div>
        
        <TimeUnit value={remainingTime.minutes} label="minuti" />
        
        <div className="text-2xl md:text-4xl font-orbitron text-cyan-500 animate-pulse">:</div>
        
        <TimeUnit value={remainingTime.seconds} label="secondi" />
        
        {/* Enhanced final message overlay */}
        <AnimatePresence>
          {showFinalMessage && (
            <motion.div 
              className="absolute inset-0 bg-black/90 backdrop-blur-xl rounded-3xl flex flex-col items-center justify-center z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              <motion.img
                src="/lovable-uploads/b349206f-bdf7-42e2-a1a6-b87988bc94f4.png" 
                alt="M1SSION Logo"
                className="w-40 h-auto mb-8" 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: 1,
                  filter: ["drop-shadow(0 0 0px rgba(255,255,255,0))", "drop-shadow(0 0 15px rgba(255,255,255,0.8))", "drop-shadow(0 0 5px rgba(255,255,255,0.5))"]
                }}
                transition={{ 
                  delay: 0.5, 
                  duration: 1,
                  filter: {
                    repeat: Infinity,
                    duration: 3
                  }
                }}
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
