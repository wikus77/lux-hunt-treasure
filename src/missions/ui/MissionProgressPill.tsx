/**
 * MISSION PROGRESS PILL
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Circular floating button like BattlePill.
 * Uses pill-orb style, positioned below Tron Battle (170px).
 * 
 * ROLLBACK: Set PILL_ENABLED = false to disable
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type MissionDefinition } from '../missionsRegistry';
import { type MissionState } from '../missionState';
import '@/features/m1u/m1u-ui.css'; // For pill-orb style

// 🎚️ ROLLBACK FLAG - Set to false to disable pill
const PILL_ENABLED = true;

interface MissionProgressPillProps {
  mission: MissionDefinition;
  missionState: MissionState;
  onClick: () => void;
}

export default function MissionProgressPill({
  mission,
  missionState,
  onClick,
}: MissionProgressPillProps) {
  const { phase } = missionState;

  // Don't show if disabled or mission completed
  if (!PILL_ENABLED || phase === 3) return null;

  const isPhase2Pending = phase === 2;
  const isNotStarted = phase === 0;

  return (
    <motion.button
      className="pill-orb fixed z-[1001]"
      style={{
        left: '16px',
        bottom: 'calc(env(safe-area-inset-bottom, 34px) + 170px)',
      }}
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      aria-label="Daily Mission"
    >
      {/* Mission icon */}
      <span style={{ fontSize: '22px', position: 'relative', zIndex: 2 }}>
        {mission.icon}
      </span>
      
      {/* Dot indicator */}
      <span 
        className="dot" 
        style={{ 
          background: isPhase2Pending ? '#FFD700' : isNotStarted ? '#00FF96' : '#0ff', 
          boxShadow: isPhase2Pending ? '0 0 8px #FFD700' : isNotStarted ? '0 0 8px #00FF96' : '0 0 8px #0ff' 
        }} 
      />
      
      {/* Phase badge */}
      <Badge
        className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[8px] font-bold border-2 border-background"
        style={{
          background: isNotStarted
            ? 'linear-gradient(135deg, #00FF96, #00CC77)'
            : isPhase2Pending 
              ? 'linear-gradient(135deg, #FFD700, #FFA500)'
              : 'linear-gradient(135deg, #00D1FF, #0099CC)',
          color: isNotStarted ? '#000' : isPhase2Pending ? '#000' : '#fff',
        }}
      >
        {isNotStarted ? '!' : isPhase2Pending ? 'P2' : 'P1'}
      </Badge>
    </motion.button>
  );
}
