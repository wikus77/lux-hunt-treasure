// © 2025 – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const LaunchCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = (): CountdownTime => {
      // Target: 19 Agosto 2025 alle 07:00 UTC+2 (05:00 UTC)
      const targetDate = new Date('2025-08-19T05:00:00Z');
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsComplete(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    // Update immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format numbers to always show two digits
  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, "0");
  };

  if (isComplete) {
    return (
      <motion.div 
        className="text-center mb-8 safe-area-top"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-4xl sm:text-6xl font-orbitron text-white tracking-wider">
          M1SSION STARTED
        </div>
        <div className="text-sm tracking-wider mt-2" style={{ color: '#d9b100' }}>
          THE TIME IS NOW
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="text-center mb-8 safe-area-top"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Countdown Timer */}
      <div className="text-3xl sm:text-5xl font-orbitron text-white tracking-wider">
        <span>{formatNumber(timeLeft.days)}</span>
        <span className="mx-1">:</span>
        <span>{formatNumber(timeLeft.hours)}</span>
        <span className="mx-1">:</span>
        <span>{formatNumber(timeLeft.minutes)}</span>
        <span className="mx-1">:</span>
        <span>{formatNumber(timeLeft.seconds)}</span>
        </div>
        
        {/* Labels */}
        <div className="text-sm text-white/60 font-orbitron tracking-widest mt-1 flex justify-center">
          <div className="grid grid-cols-4 gap-8 text-center">
            <span>DAYS</span>
            <span>HOURS</span>
            <span>MINUTES</span>
            <span>SECONDS</span>
          </div>
        </div>
        
        {/* Motivational Text */}
        <div 
          className="text-sm tracking-wider mt-4 font-orbitron"
          style={{ color: '#d9b100' }}
        >
        IT IS POSSIBLE
      </div>
    </motion.div>
  );
};

export default LaunchCountdown;