
import React, { useMemo } from 'react';
import { getMissionDeadline } from "@/utils/countdownDate";

export const LaunchProgressBar = () => {
  const launchDate = getMissionDeadline();
  
  const progressPercentage = useMemo(() => {
    // Starting from 90 days before launch
    const totalTimespan = 90 * 24 * 60 * 60 * 1000; // 90 days in ms
    const startDate = new Date(launchDate.getTime() - totalTimespan);
    const now = new Date();
    
    if (now >= launchDate) return 100;
    if (now <= startDate) return 0;
    
    const elapsed = now.getTime() - startDate.getTime();
    const percentage = (elapsed / totalTimespan) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  }, [launchDate]);
  
  return (
    <div className="w-full py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Preparazione</span>
          <span className="text-sm text-white/70">Lancio</span>
        </div>
        <div className="h-4 w-full bg-white/10 rounded-full relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-50">
              <div className="w-20 h-full bg-white/20 -skew-x-12 animate-[pulse_1.5s_infinite] blur-md"></div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center text-sm">
          <span className="gradient-text-cyan">
            {progressPercentage.toFixed(0)}% completato
          </span>
        </div>
      </div>
    </div>
  );
};
