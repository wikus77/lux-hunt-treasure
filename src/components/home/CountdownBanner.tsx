
import { useEffect, useState } from "react";
import { getMissionDeadline, getRemainingDays } from "@/utils/countdownDate";

function getTimeLeft() {
  const targetDate = getMissionDeadline();
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };

  const days = getRemainingDays();
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return { days, hours, minutes };
}

export default function CountdownBanner() {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    // Update immediately and then every second
    setTime(getTimeLeft());
    const timer = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-black/70 neon-border px-7 py-3 rounded-xl shadow-lg flex flex-col items-center">
      <span className="block text-xs text-cyan-200 pb-0.5">Tempo rimasto</span>
      <div className="flex gap-3 text-lg font-orbitron text-cyan-300">
        <span className="animate-neon-pulse">{time.days}g</span>
        <span>:</span>
        <span className="animate-neon-pulse">{time.hours}h</span>
        <span>:</span>
        <span className="animate-neon-pulse">{time.minutes}m</span>
      </div>
    </div>
  );
}
