
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Calcolo del tempo rimanente alla prossima missione (prossimo mese, giorno 1, ore 00:00)
function getTimeRemaining() {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0); // primo giorno del mese prossimo
  const diff = target.getTime() - now.getTime();

  const total = Math.max(diff, 0);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export default function BigCountdownTimer() {
  const [remainingTime, setRemainingTime] = useState<TimeRemaining>(getTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(getTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center justify-center w-full mt-8"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.7, 0.2, 0.2, 1] }}
    >
      <h2 className="font-orbitron neon-text-cyan text-xl sm:text-2xl mb-2 text-center tracking-widest">
        Tempo rimasto alla prossima missione!
      </h2>
      <div
        className="bg-black/70 neon-border px-12 py-10 rounded-3xl shadow-2xl flex gap-10 items-center glass-card animate-fade-in"
        style={{
          boxShadow: "0 8px 38px 0 rgba(30,174,219,0.18), 0 0px 64px 0 #00e5ff2a"
        }}
      >
        <div className="flex flex-wrap gap-8 items-center">
          <div>
            <div className="text-base text-cyan-200 pb-1 text-center font-orbitron tracking-wider">Giorni</div>
            <div className="text-6xl font-bold font-orbitron text-cyan-300 animate-neon-pulse text-center">
              {remainingTime.days.toString().padStart(2, "0")}
            </div>
          </div>
          <span className="text-5xl font-orbitron font-bold text-cyan-400">:</span>
          <div>
            <div className="text-base text-cyan-200 pb-1 text-center font-orbitron tracking-wider">Ore</div>
            <div className="text-6xl font-bold font-orbitron text-cyan-300 animate-neon-pulse text-center">
              {remainingTime.hours.toString().padStart(2, "0")}
            </div>
          </div>
          <span className="text-5xl font-orbitron font-bold text-cyan-400">:</span>
          <div>
            <div className="text-base text-cyan-200 pb-1 text-center font-orbitron tracking-wider">Minuti</div>
            <div className="text-6xl font-bold font-orbitron text-cyan-300 animate-neon-pulse text-center">
              {remainingTime.minutes.toString().padStart(2, "0")}
            </div>
          </div>
          <span className="text-5xl font-orbitron font-bold text-cyan-400">:</span>
          <div>
            <div className="text-base text-cyan-200 pb-1 text-center font-orbitron tracking-wider">Secondi</div>
            <div className="text-6xl font-bold font-orbitron text-cyan-300 animate-neon-pulse text-center">
              {remainingTime.seconds.toString().padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
