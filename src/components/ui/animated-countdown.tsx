
import React, { useState, useEffect } from 'react';

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
      <div className="text-center">
        <div className="text-2xl md:text-3xl font-bold text-green-400 font-orbitron">
          MISSION START
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-white my-6 font-orbitron">
      {/* Countdown numbers with exact spacing matching screenshot */}
      <div className="flex items-center justify-center gap-3 text-lg md:text-xl font-mono tracking-wider">
        <span className="text-white font-bold text-2xl md:text-3xl">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-white/70">:</span>
        <span className="text-white font-bold text-2xl md:text-3xl">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-white/70">:</span>
        <span className="text-white font-bold text-2xl md:text-3xl">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-white/70">:</span>
        <span className="text-white font-bold text-2xl md:text-3xl">{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
      
      {/* Labels underneath */}
      <div className="flex items-center justify-center gap-8 md:gap-12 mt-2 text-xs uppercase tracking-widest opacity-70">
        <span>DAYS</span>
        <span>HOURS</span>
        <span>MINUTES</span>
        <span>SECONDS</span>
      </div>
    </div>
  );
};
