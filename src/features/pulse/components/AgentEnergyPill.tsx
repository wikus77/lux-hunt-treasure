/**
 * THE PULSE™ — AGENT ENERGY PILL (M1SSION Style - Like M1U Orb)
 * Pill circolare stile M1SSION con anelli rotanti
 * Click apre RankDetailModal con info complete
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useHierarchyRank } from '@/hooks/useHierarchyRank';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import '@/features/pulse/styles/pulse-pill.css';
import RankDetailModal from '@/components/rank/RankDetailModal';

export const AgentEnergyPill = () => {
  const { state, isLoading } = useHierarchyRank();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPEGain, setShowPEGain] = useState(false);
  const [lastPE, setLastPE] = useState(0);

  const pulseEnergy = state?.pulseEnergy ?? 0;
  const currentLevel = state?.currentLevel;
  const progressPercent = state?.progressPercent ?? 0;

  // Show PE gain animation
  useEffect(() => {
    if (pulseEnergy > lastPE && lastPE > 0) {
      setShowPEGain(true);
      setTimeout(() => setShowPEGain(false), 2500);
    }
    setLastPE(pulseEnergy);
  }, [pulseEnergy, lastPE]);

  const formatPE = (pe: number) => {
    if (pe >= 1000000) return `${(pe / 1000000).toFixed(1)}M`;
    if (pe >= 1000) return `${(pe / 1000).toFixed(1)}K`;
    return pe.toString();
  };

  if (isLoading) {
    return <div className="pe-pill-orb opacity-50" />;
  }

  const rankColor = currentLevel?.color || '#00e7ff';

  return (
    <div className="relative">
      {/* Main Orb - Click opens full modal */}
      <motion.button
        className="pe-pill-orb"
        aria-label="Agent Energy - Tap per dettagli"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        style={{
          borderColor: `${rankColor}50`,
        }}
      >
        {/* Rank symbol inside */}
        <span className="text-lg z-10 relative">{currentLevel?.icon || '❓'}</span>
        
        {/* Orbiting dot */}
        <span className="pe-dot" style={{ background: rankColor }} />
        
        {/* Progress arc overlay */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={`${rankColor}20`}
            strokeWidth="2"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={rankColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${progressPercent * 2.83} 283`}
            style={{ 
              transition: 'stroke-dasharray 0.8s ease',
              filter: `drop-shadow(0 0 4px ${rankColor})`,
            }}
          />
        </svg>
      </motion.button>

      {/* PE Gain Animation */}
      <AnimatePresence>
        {showPEGain && pulseEnergy > lastPE && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-20"
            initial={{ opacity: 0, y: 5, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
          >
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/50 text-emerald-400">
              <Zap className="w-3 h-3" />
              +{pulseEnergy - lastPE} PE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rank Detail Modal */}
      <RankDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
