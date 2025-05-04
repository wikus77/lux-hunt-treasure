
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDuration, intervalToDuration } from 'date-fns';

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  className?: string;
}

const CountdownTimer = ({ targetDate, onComplete, className = "" }: CountdownTimerProps) => {
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
        setIsComplete(true);
        onComplete?.();
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }
      
      const duration = intervalToDuration({
        start: now,
        end: targetDate
      });
      
      return duration;
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);
  
  // Format numbers to always show two digits (e.g., 09 instead of 9)
  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return "00";
    return num.toString().padStart(2, "0");
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
          <div className="text-center font-orbitron text-white">
            [ 00 : 00 : 00 : 00 ]
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex items-center justify-center text-white font-orbitron tracking-wider">
        <span className="opacity-50">[ </span>
        <div className="flex items-center">
          <div className="flex flex-col items-center mx-1 sm:mx-2">
            <span className="text-base sm:text-xl">{formatNumber(timeLeft.days)}</span>
            <span className="text-[0.6rem] sm:text-xs uppercase tracking-wider text-gray-400">days</span>
          </div>
          
          <span className="opacity-50 mx-0.5">:</span>
          
          <div className="flex flex-col items-center mx-1 sm:mx-2">
            <span className="text-base sm:text-xl">{formatNumber(timeLeft.hours)}</span>
            <span className="text-[0.6rem] sm:text-xs uppercase tracking-wider text-gray-400">hours</span>
          </div>
          
          <span className="opacity-50 mx-0.5">:</span>
          
          <div className="flex flex-col items-center mx-1 sm:mx-2">
            <span className="text-base sm:text-xl">{formatNumber(timeLeft.minutes)}</span>
            <span className="text-[0.6rem] sm:text-xs uppercase tracking-wider text-gray-400">minutes</span>
          </div>
          
          <span className="opacity-50 mx-0.5">:</span>
          
          <div className="flex flex-col items-center mx-1 sm:mx-2">
            <span className="text-base sm:text-xl">{formatNumber(timeLeft.seconds)}</span>
            <span className="text-[0.6rem] sm:text-xs uppercase tracking-wider text-gray-400">seconds</span>
          </div>
        </div>
        <span className="opacity-50"> ]</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
