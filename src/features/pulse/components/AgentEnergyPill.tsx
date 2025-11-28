/**
 * THE PULSE™ — AGENT ENERGY PILL (M1SSION Style - Like M1U Orb)
 * Pill circolare stile M1SSION con anelli rotanti
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useAgentEnergy } from '../hooks/useAgentEnergy';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import '@/features/pulse/styles/pulse-pill.css';

export const AgentEnergyPill = () => {
  const { energy, isLoading, lastDelta } = useAgentEnergy();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPEGain, setShowPEGain] = useState(false);

  const pulseEnergy = energy?.pulseEnergy ?? 0;
  const rank = energy?.rank;
  const progressPercent = energy?.progressToNextRank ?? 0;
  const peToNext = energy?.peToNextRank ?? 0;
  const nextRank = energy?.nextRank;
  const rankLevel = rank ? parseInt(rank.code.match(/\d+/)?.[0] || '1') : 1;

  useEffect(() => {
    if (lastDelta && lastDelta > 0) {
      setShowPEGain(true);
      setTimeout(() => setShowPEGain(false), 2500);
    }
  }, [lastDelta]);

  const formatPE = (pe: number) => {
    if (pe >= 1000000) return `${(pe / 1000000).toFixed(1)}M`;
    if (pe >= 1000) return `${(pe / 1000).toFixed(1)}K`;
    return pe.toString();
  };

  if (isLoading) {
    return <div className="pe-pill-orb opacity-50" />;
  }

  return (
    <div className="relative">
      {/* Main Orb - Same style as M1U Plus button */}
      <motion.button
        className="pe-pill-orb"
        aria-label="Agent Energy"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Rank symbol inside */}
        <span className="text-lg z-10 relative">{rank?.symbol || '🔰'}</span>
        
        {/* Orbiting dot */}
        <span className="pe-dot" />
        
        {/* Progress arc overlay */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(0, 255, 200, 0.15)"
            strokeWidth="2"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="url(#peGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${progressPercent * 2.83} 283`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
          <defs>
            <linearGradient id="peGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
          </defs>
        </svg>
      </motion.button>

      {/* PE Gain Animation */}
      <AnimatePresence>
        {showPEGain && lastDelta && lastDelta > 0 && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-20"
            initial={{ opacity: 0, y: 5, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
          >
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/50 text-emerald-400">
              <Zap className="w-3 h-3" />
              +{lastDelta} PE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <>
            <div className="fixed inset-0 z-[140]" onClick={() => setIsExpanded(false)} />
            
            <motion.div
              className="absolute top-full left-0 mt-2 z-[150] min-w-[220px]"
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div 
                className="p-4 rounded-2xl"
                style={{
                  background: 'radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,.06), rgba(0,0,0,.4) 58%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 2px 20px rgba(0,0,0,.5), 0 0 30px rgba(0, 255, 200, 0.1) inset',
                  backdropFilter: 'blur(16px)',
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                  <span className="text-2xl">{rank?.symbol}</span>
                  <div>
                    <div className="text-sm font-bold font-orbitron" style={{ color: rank?.color || '#00d4ff' }}>
                      {rank?.name_it || 'Recluta'}
                    </div>
                    <div className="text-[10px] font-mono text-white/40">
                      {rank?.code} • LVL {rankLevel}
                    </div>
                  </div>
                </div>

                {/* PE Display */}
                <div className="mb-3">
                  <div className="text-[9px] font-mono text-cyan-400/50 mb-1">PULSE ENERGY</div>
                  <div className="text-2xl font-bold font-orbitron" style={{
                    background: 'linear-gradient(90deg, #00d4ff, #8b5cf6, #00ff88)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {formatPE(pulseEnergy)}
                    <span className="text-xs text-white/30 ml-1" style={{ WebkitTextFillColor: 'initial' }}>PE</span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-[9px] font-mono mb-1">
                    <span className="text-white/40">PROGRESS</span>
                    <span className="text-cyan-400">{Math.round(progressPercent)}%</span>
                  </div>
                  
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #00d4ff, #8b5cf6, #00ff88)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {nextRank && (
                    <div className="mt-2 text-[9px] font-mono text-white/30">
                      → <span style={{ color: nextRank.color }}>{nextRank.symbol} {nextRank.name_it}</span>
                      <span className="text-white/20"> ({formatPE(peToNext)} PE)</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
