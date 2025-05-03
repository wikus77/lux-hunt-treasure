
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
  
  // Enhanced pulse animation effect triggered every 10 seconds
  useEffect(() => {
    const currentSeconds = remainingTime.seconds;
    if (currentSeconds % 10 === 0 && currentSeconds !== prevSecondsRef.current) {
      setPulseTrigger(true);
      setTimeout(() => setPulseTrigger(false), 1000);
    }
    prevSecondsRef.current = currentSeconds;
  }, [remainingTime.seconds]);

  return (
    <motion.div 
      className="mt-8 mb-14 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Futuristic title with glow effect */}
      <motion.h2
        className="font-orbitron text-center mb-6 text-xl md:text-3xl tracking-widest"
        style={{
          background: "linear-gradient(90deg, #9b87f5, #7c3aed, #4c1d95)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 15px rgba(139, 92, 246, 0.7)"
        }}
        animate={{
          textShadow: [
            "0 0 5px rgba(139, 92, 246, 0.3)",
            "0 0 15px rgba(139, 92, 246, 0.8)",
            "0 0 5px rgba(139, 92, 246, 0.3)"
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Tempo rimasto alla prossima missione
      </motion.h2>

      {/* Futuristic container with hologram effect */}
      <div className="relative max-w-5xl mx-auto">
        {/* Hologram effect */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)",
              filter: "blur(8px)"
            }}>
          </div>
        </div>

        {/* Main countdown container */}
        <div className={cn(
          "bg-black/40 backdrop-blur-lg rounded-xl px-4 py-6 md:p-8", 
          "border border-purple-500/30",
          "flex flex-col items-center justify-center",
          "relative overflow-hidden"
        )}
        style={{
          background: "linear-gradient(160deg, rgba(0,0,0,0.9) 0%, rgba(76, 29, 149, 0.1) 100%)",
          boxShadow: pulseTrigger 
            ? "0 0 30px rgba(124, 58, 237, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)" 
            : "0 0 20px rgba(124, 58, 237, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)"
        }}>
          {/* Glowing lines */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>
          
          {/* Moving light beam */}
          <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
            <div className="absolute h-full w-[100px] skew-x-12 -left-32 top-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-[lineMove_4s_linear_infinite]"></div>
          </div>

          {/* Digital display grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 md:gap-6 w-full max-w-3xl mx-auto">
            {/* Time unit blocks - Days */}
            <TimeBlock 
              value={remainingTime.days} 
              label="GIORNI"
              pulsing={pulseTrigger}
            />

            {/* Time unit blocks - Hours */}
            <TimeBlock 
              value={remainingTime.hours} 
              label="ORE"
              pulsing={pulseTrigger}
            />

            {/* Time unit blocks - Minutes */}
            <TimeBlock 
              value={remainingTime.minutes} 
              label="MINUTI"
              pulsing={pulseTrigger}
            />

            {/* Time unit blocks - Seconds */}
            <TimeBlock 
              value={remainingTime.seconds} 
              label="SECONDI"
              pulsing={pulseTrigger}
              highlight={true}
            />
          </div>

          {/* Mission complete overlay */}
          <AnimatePresence>
            {showFinalMessage && (
              <motion.div 
                className="absolute inset-0 z-20 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <motion.img
                  src="/lovable-uploads/b349206f-bdf7-42e2-a1a6-b87988bc94f4.png"
                  alt="M1SSION Logo"
                  className="w-40 h-auto mb-6"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    filter: ["drop-shadow(0 0 10px rgba(124, 58, 237, 0.5))", "drop-shadow(0 0 20px rgba(124, 58, 237, 0.8))", "drop-shadow(0 0 10px rgba(124, 58, 237, 0.5))"]
                  }}
                  transition={{ 
                    delay: 0.3, 
                    duration: 0.5,
                    filter: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
                
                <motion.div 
                  className="text-2xl md:text-4xl font-orbitron tracking-widest"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  style={{
                    background: "linear-gradient(90deg, #9b87f5, #7c3aed, #4c1d95)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    textShadow: "0 0 15px rgba(124, 58, 237, 0.8)"
                  }}
                >
                  IT IS POSSIBLE
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Circuit board patterns */}
        <div className="absolute inset-0 -z-20 opacity-10">
          <div className="w-full h-full" 
            style={{ 
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              backgroundSize: "30px 30px",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Component for each time block (days, hours, minutes, seconds)
function TimeBlock({ value, label, pulsing = false, highlight = false }: { 
  value: number; 
  label: string; 
  pulsing?: boolean;
  highlight?: boolean;
}) {
  const formattedValue = value.toString().padStart(2, "0");
  
  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        "font-orbitron text-xs tracking-widest mb-1 text-center",
        highlight ? "text-purple-300" : "text-purple-300/80"
      )}>
        {label}
      </div>
      
      <motion.div
        className={cn(
          "relative w-full aspect-square flex items-center justify-center overflow-hidden",
          "rounded-lg border backdrop-blur-md",
          highlight ? "border-purple-500/50" : "border-purple-500/30"
        )}
        style={{
          background: "linear-gradient(145deg, rgba(0,0,0,0.9) 0%, rgba(76, 29, 149, 0.15) 100%)",
          boxShadow: pulsing && highlight
            ? "0 0 20px rgba(139, 92, 246, 0.6), inset 0 0 5px rgba(139, 92, 246, 0.3)"
            : "0 0 10px rgba(139, 92, 246, 0.3), inset 0 0 5px rgba(139, 92, 246, 0.1)"
        }}
        animate={highlight ? {
          boxShadow: pulsing
            ? ["0 0 10px rgba(139, 92, 246, 0.3)", "0 0 25px rgba(139, 92, 246, 0.6)", "0 0 10px rgba(139, 92, 246, 0.3)"]
            : ["0 0 10px rgba(139, 92, 246, 0.3)", "0 0 15px rgba(139, 92, 246, 0.4)", "0 0 10px rgba(139, 92, 246, 0.3)"]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Light edge reflection */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
        
        {/* Number display with animation */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={formattedValue}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            style={{
              background: highlight 
                ? "linear-gradient(to bottom, #c4b5fd, #8b5cf6, #7c3aed)"
                : "linear-gradient(to bottom, #c4b5fd, #8b5cf6, #4c1d95)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textShadow: highlight 
                ? "0 0 10px rgba(139, 92, 246, 0.8)"
                : "0 0 8px rgba(139, 92, 246, 0.6)"
            }}
          >
            {formattedValue}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
