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
  const [displayDelta, setDisplayDelta] = useState(0);

  const pulseEnergy = state?.pulseEnergy ?? 0;
  const currentLevel = state?.currentLevel;
  const progressPercent = state?.progressPercent ?? 0;

  // Show PE gain animation: capture delta so badge stays visible
  useEffect(() => {
    if (pulseEnergy > lastPE && lastPE >= 0) {
      setDisplayDelta(pulseEnergy - lastPE);
      setShowPEGain(true);
      setLastPE(pulseEnergy);
      const t = setTimeout(() => {
        setShowPEGain(false);
        setDisplayDelta(0);
      }, 2800);
      return () => clearTimeout(t);
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
    <div className="relative flex flex-col items-center gap-1">
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

      {/* PE value badge — leggibile su iPhone, primo colpo d'occhio */}
      <div
        className="px-2.5 py-1.5 rounded-md min-w-[3rem] text-center font-black font-mono tabular-nums text-base"
        style={{
          color: rankColor,
          background: 'rgba(0,0,0,0.55)',
          border: `1px solid ${rankColor}77`,
          boxShadow: `0 0 12px ${rankColor}44, inset 0 0 8px ${rankColor}22`,
          textShadow: `0 0 10px ${rankColor}, 0 1px 2px rgba(0,0,0,0.9)`,
        }}
      >
        {formatPE(pulseEnergy)} <span className="text-xs font-bold opacity-90">PE</span>
      </div>

      {/* PE Gain Animation */}
      <AnimatePresence>
        {showPEGain && displayDelta > 0 && (
          <motion.div
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap z-20"
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.85 }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-500/25 border border-emerald-400/50 text-emerald-300">
              <Zap className="w-3.5 h-3.5" />
              +{displayDelta} PE
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
