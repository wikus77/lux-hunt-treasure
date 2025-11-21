
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

  const FlipCard: React.FC<{ value: number; label: string }> = ({ value, label }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isFlipping, setIsFlipping] = useState(false);

    useEffect(() => {
      if (value !== displayValue) {
        setIsFlipping(true);
        setTimeout(() => {
          setDisplayValue(value);
          setIsFlipping(false);
        }, 150);
      }
    }, [value, displayValue]);

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-20 md:w-20 md:h-24 perspective-1000">
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-xl border border-gray-600 flex items-center justify-center overflow-hidden"
            animate={{
              rotateX: isFlipping ? -90 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <span className="text-2xl md:text-3xl font-bold text-white font-mono">
              {String(displayValue).padStart(2, '0')}
            </span>
          </motion.div>
        </div>
        <span className="text-xs md:text-sm text-gray-400 mt-2 uppercase tracking-wider">
          {label}
        </span>
      </div>
    );
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div 
          className="text-xl md:text-2xl font-bold text-green-400"
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

  return (
    <div className="flex items-center justify-center space-x-4 md:space-x-6">
      <FlipCard value={timeLeft.days} label="giorni" />
      <div className="text-2xl md:text-3xl text-white font-bold">:</div>
      <FlipCard value={timeLeft.hours} label="ore" />
      <div className="text-2xl md:text-3xl text-white font-bold">:</div>
      <FlipCard value={timeLeft.minutes} label="min" />
      <div className="text-2xl md:text-3xl text-white font-bold">:</div>
      <FlipCard value={timeLeft.seconds} label="sec" />
    </div>
  );
};
