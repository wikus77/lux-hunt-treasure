
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMissionDeadline } from "@/utils/countdownDate";

// Define the Duration interface since it's not directly exportable from date-fns
interface Duration {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

interface CountdownTimerProps {
  targetDate?: Date;
  onComplete?: () => void;
  className?: string;
}

const CountdownTimer = ({ targetDate: propTargetDate, onComplete, className = "" }: CountdownTimerProps) => {
  // Use the provided targetDate or fall back to the mission deadline
  const targetDate = propTargetDate || getMissionDeadline();
  
  const [timeLeft, setTimeLeft] = useState<Duration>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      
      if (targetDate.getTime() <= now.getTime()) {
        if (!isComplete) {
          setIsComplete(true);
          onComplete?.();
        }
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }
      
      const diff = targetDate.getTime() - now.getTime();
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { days, hours, minutes, seconds };
    };
    
    // Update immediately when component mounts
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000); // Update every second
    
    return () => clearInterval(timer);
  }, [targetDate, onComplete, isComplete]);
  
  // Format numbers to always show two digits (e.g., 09 instead of 9)
  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return "00";
    return num.toString().padStart(2, "0");
  };
  
  const AnimatedNumber = ({ value, label }: { value: number | undefined, label: string }) => {
    const [displayValue, setDisplayValue] = useState(value || 0);
    
    useEffect(() => {
      if (value !== displayValue) {
        setDisplayValue(value || 0);
      }
    }, [value, displayValue]);
    
    return (
      <motion.div className="flex flex-col items-center mx-1 sm:mx-2">
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={displayValue}
              className="text-base sm:text-xl block"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {formatNumber(displayValue)}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="text-[0.6rem] sm:text-xs uppercase tracking-wider text-gray-400">{label}</span>
      </motion.div>
    );
  };
  
  if (isComplete && !timeLeft.days && !timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className={`flex flex-col items-center justify-center ${className}`}
        >
          <motion.div 
            className="text-center font-orbitron text-white text-glitch text-xl"
            animate={{
              textShadow: [
                "0 0 5px rgba(0, 255, 0, 0.5)",
                "0 0 20px rgba(0, 255, 0, 0.8)",
                "0 0 5px rgba(0, 255, 0, 0.5)"
              ]
            }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            MISSION START
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex items-center justify-center text-white font-orbitron tracking-wider">
        <span className="opacity-50">[ </span>
        <div className="flex items-center">
          <AnimatedNumber value={timeLeft.days} label="days" />
          
          <span className="opacity-50 mx-0.5">:</span>
          
          <AnimatedNumber value={timeLeft.hours} label="hours" />
          
          <span className="opacity-50 mx-0.5">:</span>
          
          <AnimatedNumber value={timeLeft.minutes} label="minutes" />
          
          <span className="opacity-50 mx-0.5">:</span>
          
          <AnimatedNumber value={timeLeft.seconds} label="seconds" />
        </div>
        <span className="opacity-50"> ]</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
