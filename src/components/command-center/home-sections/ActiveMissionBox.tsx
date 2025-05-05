
import React, { useEffect, useState } from "react";
import { Calendar, Map, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MagneticButton } from "@/components/ui/magnetic-button";

interface MissionProps {
  mission: {
    id: string;
    title: string;
    totalClues: number;
    foundClues: number;
    timeLimit: string;
    startTime: string;
  };
}

export function ActiveMissionBox({ mission }: MissionProps) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const progressPercentage = (mission.foundClues / mission.totalClues) * 100;

  // Calculate time left
  useEffect(() => {
    // Parse the time limit
    const [hours, minutes, seconds] = mission.timeLimit.split(':').map(Number);
    const totalLimitSeconds = hours * 3600 + minutes * 60 + seconds;
    
    // Calculate end time
    const startTime = new Date(mission.startTime).getTime();
    const endTime = startTime + totalLimitSeconds * 1000;
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = endTime - now;
      
      if (difference <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      
      // Calculate hours, minutes, seconds
      const hoursLeft = Math.floor(difference / (1000 * 60 * 60));
      const minutesLeft = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((difference % (1000 * 60)) / 1000);
      
      // Format the time
      setTimeLeft(
        `${hoursLeft.toString().padStart(2, '0')}:${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`
      );
    };
    
    // Update immediately
    updateTimer();
    
    // Set interval to update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [mission.timeLimit, mission.startTime]);

  return (
    <motion.div
      className="glass-card p-4 border border-white/10"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">{mission.title}</h2>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
            <div className="flex items-center text-cyan-400">
              <Calendar size={16} className="mr-1" />
              <span>Missione attiva</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-white/70">Tempo rimasto:</span>
              <span className="ml-2 font-mono text-amber-400">{timeLeft}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-white/70">Indizi:</span>
              <span className="ml-2 font-medium">
                <span className="text-cyan-400">{mission.foundClues}</span>
                <span className="text-white/50">/</span>
                <span className="text-white/80">{mission.totalClues}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex mt-4 md:mt-0 gap-2">
          <MagneticButton
            className="neon-button-cyan"
            onClick={() => navigate('/map')}
          >
            <div className="flex items-center">
              <Map size={16} className="mr-1" />
              <span>Apri Mappa</span>
            </div>
          </MagneticButton>
          
          <MagneticButton
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors"
            onClick={() => navigate('/buzz')}
          >
            <div className="flex items-center">
              <span>Indizi</span>
              <ArrowRight size={16} className="ml-1" />
            </div>
          </MagneticButton>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/10 mt-4 rounded overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
