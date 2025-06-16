
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedCountdownProps {
  targetDate: Date;
  onComplete?: () => void;
}

export const AnimatedCountdown: React.FC<AnimatedCountdownProps> = ({ targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsComplete(true);
        onComplete?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div 
          className="text-2xl md:text-3xl font-bold text-green-400"
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
    );
  }

  // Stile basato esattamente sullo screenshot: numeri grandi, puliti, centrati
  return (
    <div className="flex items-center justify-center space-x-8 my-8">
      {/* Days */}
      <div className="flex flex-col items-center">
        <div className="text-6xl md:text-7xl font-bold text-white font-mono tracking-tight">
          {String(timeLeft.days).padStart(2, '0')}
        </div>
        <div className="text-sm md:text-base text-gray-300 uppercase tracking-wider font-medium mt-2">
          DAYS
        </div>
      </div>

      {/* Hours */}
      <div className="flex flex-col items-center">
        <div className="text-6xl md:text-7xl font-bold text-white font-mono tracking-tight">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <div className="text-sm md:text-base text-gray-300 uppercase tracking-wider font-medium mt-2">
          HOURS
        </div>
      </div>

      {/* Minutes */}
      <div className="flex flex-col items-center">
        <div className="text-6xl md:text-7xl font-bold text-white font-mono tracking-tight">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <div className="text-sm md:text-base text-gray-300 uppercase tracking-wider font-medium mt-2">
          MINUTES
        </div>
      </div>

      {/* Seconds */}
      <div className="flex flex-col items-center">
        <div className="text-6xl md:text-7xl font-bold text-white font-mono tracking-tight">
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        <div className="text-sm md:text-base text-gray-300 uppercase tracking-wider font-medium mt-2">
          SECONDS
        </div>
      </div>
    </div>
  );
};
