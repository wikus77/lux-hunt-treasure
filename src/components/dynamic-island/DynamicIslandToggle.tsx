// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Dynamic Island Toggle Component

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Circle } from 'lucide-react';
import { useDynamicIsland } from '@/hooks/useDynamicIsland';
import { useMissionStatus } from '@/hooks/useMissionStatus';

interface DynamicIslandToggleProps {
  className?: string;
  showLabel?: boolean;
}

const DynamicIslandToggle: React.FC<DynamicIslandToggleProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const { isActive, toggle, updateStatus } = useDynamicIsland();
  const { missionStatus: realMissionStatus } = useMissionStatus();

  // Sync real mission data with Dynamic Island
  useEffect(() => {
    if (realMissionStatus && isActive) {
      updateStatus({
        cluesFound: realMissionStatus.cluesFound,
        totalClues: realMissionStatus.totalClues,
        daysRemaining: realMissionStatus.daysRemaining,
        missionName: realMissionStatus.title
      });
    }
  }, [realMissionStatus, isActive, updateStatus]);

  return (
    <motion.button
      onClick={toggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${className}`}
      style={{
        background: isActive 
          ? 'linear-gradient(135deg, rgba(0, 209, 255, 0.3) 0%, rgba(123, 46, 255, 0.3) 100%)'
          : 'rgba(255, 255, 255, 0.1)',
        border: isActive 
          ? '1px solid rgba(0, 209, 255, 0.5)' 
          : '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: isActive 
          ? '0 0 20px rgba(0, 209, 255, 0.3)' 
          : 'none'
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Icon */}
      <motion.div
        animate={isActive ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isActive ? (
          <Radio className="w-4 h-4 text-cyan-400" />
        ) : (
          <Circle className="w-4 h-4 text-gray-400" />
        )}
      </motion.div>

      {/* Label */}
      {showLabel && (
        <span className={`text-xs font-medium ${isActive ? 'text-cyan-400' : 'text-gray-400'}`}>
          {isActive ? 'LIVE' : 'Dynamic Island'}
        </span>
      )}

      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          className="w-2 h-2 rounded-full bg-green-400"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)'
          }}
        />
      )}
    </motion.button>
  );
};

export default DynamicIslandToggle;

