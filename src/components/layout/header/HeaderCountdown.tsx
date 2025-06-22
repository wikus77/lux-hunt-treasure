
import React, { useState, useEffect } from "react";
import { getMissionDeadline } from "@/utils/countdownDate";

interface HeaderCountdownProps {
  isMobile: boolean;
}

const HeaderCountdown: React.FC<HeaderCountdownProps> = ({ isMobile }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadline = getMissionDeadline();
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return { days, hours, minutes };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-center py-2 border-t border-white/10">
      <div className="bg-black/70 px-4 py-1 rounded-full text-xs text-cyan-300 font-orbitron">
        <span>Tempo rimasto: </span>
        <span className="text-cyan-400 font-bold">
          {timeLeft.days}g {timeLeft.hours}h {timeLeft.minutes}m
        </span>
      </div>
    </div>
  );
};

export default HeaderCountdown;
