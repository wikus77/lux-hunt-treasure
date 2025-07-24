// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - Weekly BUZZ Status Display Component

import React from 'react';
import { useBuzzMapWeeklySystem } from '@/hooks/map/useBuzzMapWeeklySystem';

interface WeeklyBuzzStatusProps {
  className?: string;
}

const WeeklyBuzzStatus: React.FC<WeeklyBuzzStatusProps> = ({ className = '' }) => {
  const { 
    weeklyStatus, 
    isLoading,
    getWeekDescription,
    getLimitMessage,
    isLimitReached 
  } = useBuzzMapWeeklySystem();

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-800/50 rounded-lg p-3 ${className}`}>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!weeklyStatus) {
    return null;
  }

  return (
    <div className={`bg-gray-900/70 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-cyan-400">
          {getWeekDescription()}
        </span>
        <span className="text-xs text-gray-400">
          Settimana {weeklyStatus.week_number}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white">
          BUZZ MAPPA utilizzati
        </span>
        <span className={`text-sm font-mono ${isLimitReached() ? 'text-red-400' : 'text-green-400'}`}>
          {weeklyStatus.buzz_count} / {weeklyStatus.max_allowed}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isLimitReached() ? 'bg-red-500' : 'bg-cyan-500'
          }`}
          style={{ 
            width: `${Math.min((weeklyStatus.buzz_count / weeklyStatus.max_allowed) * 100, 100)}%` 
          }}
        />
      </div>

      <div className={`text-xs ${isLimitReached() ? 'text-red-400' : 'text-gray-400'}`}>
        {getLimitMessage()}
      </div>
    </div>
  );
};

export default WeeklyBuzzStatus;