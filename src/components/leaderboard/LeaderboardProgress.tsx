
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface LeaderboardProgressProps {
  currentPosition: number;
  totalPlayers: number;
}

export function LeaderboardProgress({ currentPosition, totalPlayers }: LeaderboardProgressProps) {
  const progressValue = Math.max(0, 100 - (currentPosition / totalPlayers) * 100);
  
  return (
    <div className="mt-8 bg-black/40 p-4 rounded-lg border border-white/5">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-400">La tua posizione:</span>
        <span className="font-bold text-cyan-400">{currentPosition}/{totalPlayers}</span>
      </div>
      <Progress value={progressValue} className="h-2 bg-gray-900">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" 
          style={{ width: `${progressValue}%` }} 
        />
      </Progress>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Top 100</span>
        <span>Top 10</span>
        <span>Top 3</span>
      </div>
    </div>
  );
}
