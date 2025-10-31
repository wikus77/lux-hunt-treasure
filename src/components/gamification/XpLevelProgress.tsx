// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';

import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp } from 'lucide-react';

interface XpLevelProgressProps {
  totalXp: number;
  className?: string;
}

export const XpLevelProgress: React.FC<XpLevelProgressProps> = ({ totalXp, className }) => {
  // Calculate level: 1 level = 1000 PE
  const level = Math.floor(totalXp / 1000) + 1;
  const xpInCurrentLevel = totalXp % 1000;
  const xpNeededForNextLevel = 1000;
  const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Level Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full"
          >
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Livello</p>
            <p className="text-2xl font-bold gradient-text">{level}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-400">XP Totale</p>
          <p className="text-xl font-semibold text-cyan-400 flex items-center gap-1">
            {totalXp.toLocaleString()}
            <TrendingUp className="w-4 h-4" />
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>{xpInCurrentLevel} XP</span>
          <span>{xpNeededForNextLevel} XP</span>
        </div>
        <div className="relative">
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-gray-800/50 border border-cyan-500/20"
          />
          <div
            className="absolute inset-0 h-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 pointer-events-none"
          />
        </div>
        <p className="text-xs text-center text-gray-500">
          {xpNeededForNextLevel - xpInCurrentLevel} XP al prossimo livello
        </p>
      </div>
    </div>
  );
};