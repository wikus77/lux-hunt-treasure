import { useEffect, useState } from "react";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = () => {
  const [remainingTime, setRemainingTime] = useState<TimeRemaining>({
    days: 14,
    hours: 23,
    minutes: 45,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          
          if (minutes < 0) {
            minutes = 59;
            hours--;
            
            if (hours < 0) {
              hours = 23;
              days--;
              
              if (days < 0) {
                clearInterval(timer);
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-3 text-center">
      <div className="bg-black/60 neon-border px-2 py-1 rounded-lg">
        <div className="text-[11px] text-cyan-200 pb-0.5">Giorni</div>
        <div className="text-lg font-bold font-orbitron text-cyan-300 animate-neon-pulse">{remainingTime.days}</div>
      </div>
      <div className="bg-black/60 neon-border px-2 py-1 rounded-lg">
        <div className="text-[11px] text-cyan-200 pb-0.5">Ore</div>
        <div className="text-lg font-bold font-orbitron text-cyan-300 animate-neon-pulse">{remainingTime.hours}</div>
      </div>
      <div className="bg-black/60 neon-border px-2 py-1 rounded-lg">
        <div className="text-[11px] text-cyan-200 pb-0.5">Minuti</div>
        <div className="text-lg font-bold font-orbitron text-cyan-300 animate-neon-pulse">{remainingTime.minutes}</div>
      </div>
      <div className="bg-black/60 neon-border px-2 py-1 rounded-lg">
        <div className="text-[11px] text-cyan-200 pb-0.5">Secondi</div>
        <div className="text-lg font-bold font-orbitron text-cyan-300 animate-neon-pulse">{remainingTime.seconds}</div>
      </div>
    </div>
  );
};

export default CountdownTimer;
