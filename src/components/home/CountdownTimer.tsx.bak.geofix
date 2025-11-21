
import { useEffect, useState } from "react";
import { getMissionDeadline } from "@/utils/countdownDate";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = () => {
  const [remainingTime, setRemainingTime] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Get target date from utility
    const targetDate = getMissionDeadline();
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { days, hours, minutes, seconds };
    };
    
    // Update immediately when component mounts
    setRemainingTime(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setRemainingTime(calculateTimeLeft());
    }, 1000); // Update every second
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-center w-full mt-4">
      <div className="bg-black/80 neon-border px-10 py-7 rounded-3xl shadow-2xl flex gap-7 items-center animate-fade-in"
        style={{
          boxShadow: "0 8px 38px 0 rgba(30,174,219,0.18), 0 0px 64px 0 #00e5ff2a"
        }}>
        <div>
          <div className="text-base text-cyan-200 pb-0.5 text-center font-orbitron tracking-wider">Giorni</div>
          <div className="text-5xl font-bold font-orbitron text-cyan-300 animate-neon-pulse text-center">{remainingTime.days}</div>
        </div>
        <span className="text-4xl font-orbitron font-bold text-cyan-400">:</span>
        <div>
          <div className="text-base text-cyan-200 pb-0.5 text-center font-orbitron tracking-wider">Ore</div>
          <div className="text-5xl font-bold font-orbitron text-cyan-300 animate-neon-pulse text-center">{remainingTime.hours}</div>
        </div>
        <span className="text-4xl font-orbitron font-bold text-cyan-400">:</span>
        <div>
          <div className="text-base text-cyan-200 pb-0.5 text-center font-orbitron tracking-wider">Minuti</div>
          <div className="text-5xl font-bold font-orbitron text-cyan-300 animate-neon-pulse text-center">{remainingTime.minutes}</div>
        </div>
        <span className="text-4xl font-orbitron font-bold text-cyan-400">:</span>
        <div>
          <div className="text-base text-cyan-200 pb-0.5 text-center font-orbitron tracking-wider">Secondi</div>
          <div className="text-5xl font-bold font-orbitron text-cyan-300 animate-neon-pulse text-center">{remainingTime.seconds}</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
