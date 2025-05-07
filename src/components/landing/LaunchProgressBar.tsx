
import React, { useMemo, useEffect } from 'react';
import { motion } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { getMissionDeadline, getRemainingDays } from "@/utils/countdownDate";

interface LaunchProgressBarProps {
  targetDate: Date;
  onCountdownComplete?: () => void;
}

const LaunchProgressBar: React.FC<LaunchProgressBarProps> = ({ targetDate, onCountdownComplete }) => {
  // Calculate progress percentage from now to target date
  const progressPercentage = useMemo(() => {
    const now = new Date();
    const startDate = new Date("2025-01-01"); // Assuming campaign started on Jan 1, 2025
    
    const totalTime = targetDate.getTime() - startDate.getTime();
    const elapsedTime = now.getTime() - startDate.getTime();
    
    let progress = (elapsedTime / totalTime) * 100;
    
    // Clip progress between 0 and 100
    progress = Math.max(0, Math.min(100, progress));
    
    return progress;
  }, [targetDate]);
  
  // Format days remaining using the consistent utility function
  const daysRemaining = useMemo(() => {
    return getRemainingDays();
  }, []);

  // Format target date to display in Italian
  const formattedDate = useMemo(() => {
    return format(targetDate, "d MMMM yyyy", { locale: it });
  }, [targetDate]);
  
  // Check if countdown is completed
  useEffect(() => {
    if (daysRemaining <= 0 && onCountdownComplete) {
      onCountdownComplete();
    }
  }, [daysRemaining, onCountdownComplete]);
  
  // Progress milestone labels
  const milestones = [
    { label: "Inizio", percent: 0 },
    { label: "Fase 1", percent: 25 },
    { label: "Fase 2", percent: 50 },
    { label: "Beta", percent: 75 },
    { label: "Lancio", percent: 100 }
  ];
  
  return (
    <section className="w-full py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col space-y-4">
          {/* Header with countdown info */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white font-orbitron">
              Stato progetto: 
              <span className="gradient-text-cyan ml-2">
                {progressPercentage < 25 ? "In preparazione" :
                 progressPercentage < 50 ? "Fase di sviluppo" :
                 progressPercentage < 75 ? "Testing interno" :
                 progressPercentage < 90 ? "Beta tester" :
                 "Pre-lancio"}
              </span>
            </h3>
            <div className="text-right">
              <p className="text-white text-sm">
                <span className="font-bold text-yellow-400">{daysRemaining}</span> days to launch
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-4 bg-black border border-white/10 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-600 relative"
            />
            
            {/* Animated glow effect */}
            <motion.div 
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: [0, 0.7, 0], x: ['0%', '100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
              className="absolute top-0 left-0 h-full w-[30%] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
            />
          </div>
          
          {/* Milestone markers */}
          <div className="flex justify-between text-xs text-gray-400 px-1">
            {milestones.map((milestone, idx) => (
              <div 
                key={idx} 
                className="flex flex-col items-center"
                style={{ width: '20%', position: 'relative' }}
              >
                <div 
                  className={`w-1.5 h-1.5 rounded-full mb-1 ${
                    progressPercentage >= milestone.percent 
                      ? 'bg-cyan-400' 
                      : 'bg-gray-700'
                  }`}
                />
                <span className={progressPercentage >= milestone.percent ? 'text-cyan-400' : 'text-gray-500'}>
                  {milestone.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LaunchProgressBar;
