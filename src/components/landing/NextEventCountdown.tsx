
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { getMissionDeadline } from "@/utils/countdownDate";

interface CountdownProps {
  targetDate: Date;
}

const NextEventCountdown = ({ targetDate }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto p-6 mb-16 glass-card relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.8 }}
    >
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#00E5FF] via-[#FF00FF] to-[#FFC107]"></div>
      
      <div className="flex items-center mb-4">
        <Clock className="text-[#00E5FF] mr-2" />
        <h3 className="text-xl font-bold text-white">Prossima M1SSION inizia in:</h3>
      </div>
      
      <div className="flex justify-center space-x-4 md:space-x-8">
        {Object.entries(timeLeft).map(([key, value]) => (
          <div key={key} className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-lg bg-black/50 border border-[#00E5FF]/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/10 to-transparent"></div>
              <span className="text-2xl md:text-3xl font-mono font-bold text-white z-10">
                {value.toString().padStart(2, '0')}
              </span>
            </div>
            <span className="mt-2 text-white/70 text-sm capitalize">{key}</span>
          </div>
        ))}
      </div>
      
      {/* Linee decorative pulsanti */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#00E5FF]/30 pulse-animation"></div>
      <div className="absolute top-1/2 right-0 w-[1px] h-1/2 bg-[#00E5FF]/30 pulse-animation"></div>
    </motion.div>
  );
};

export default NextEventCountdown;
