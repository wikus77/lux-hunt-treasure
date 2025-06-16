
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
        <div className="text-2xl md:text-3xl font-bold text-white font-orbitron" style={{ fontWeight: 700 }}>
          STARTS ON AUGUST 19
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-white my-6 font-orbitron">
      {/* Countdown numbers with exact bracket format */}
      <div className="flex items-center justify-center text-lg md:text-xl font-orbitron tracking-wider">
        <span className="text-white/70">[ </span>
        <span className="text-white font-bold text-3xl md:text-4xl mx-1" style={{ fontWeight: 700 }}>
          {String(timeLeft.days).padStart(2, '0')}
        </span>
        <span className="text-white/70"> ]</span>
        <span className="text-white/70 mx-3">:</span>
        <span className="text-white/70">[ </span>
        <span className="text-white font-bold text-3xl md:text-4xl mx-1" style={{ fontWeight: 700 }}>
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-white/70"> ]</span>
        <span className="text-white/70 mx-3">:</span>
        <span className="text-white/70">[ </span>
        <span className="text-white font-bold text-3xl md:text-4xl mx-1" style={{ fontWeight: 700 }}>
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-white/70"> ]</span>
        <span className="text-white/70 mx-3">:</span>
        <span className="text-white/70">[ </span>
        <span className="text-white font-bold text-3xl md:text-4xl mx-1" style={{ fontWeight: 700 }}>
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-white/70"> ]</span>
      </div>
      
      {/* Labels underneath with exact spacing */}
      <div className="flex items-center justify-center gap-12 md:gap-16 mt-3 text-xs uppercase tracking-widest font-orbitron" style={{ color: '#B0B0B0' }}>
        <span>DAYS</span>
        <span>HOURS</span>
        <span>MINUTES</span>
        <span>SECONDS</span>
      </div>
    </div>
  );
};
