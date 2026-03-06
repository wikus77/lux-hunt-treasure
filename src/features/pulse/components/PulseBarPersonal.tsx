/**
 * THE PULSE™ — Personal Energy Bar (PER UTENTE)
 * Design migliorato con info complete: Rank, Livello, PE, Badge prossimo livello
 * 
 * 🏪 STORE COMPLIANCE (28/01/2026):
 * - PulseBreaker conditionally loaded (hidden on native)
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useHierarchyRank } from '@/hooks/useHierarchyRank';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PULSE_ENABLED } from '@/config/featureFlags';
import { PulseBreaker } from '@/features/pulse-breaker';
import { isPulseBreakerEnabled } from '@/utils/storeCompliance';
import { ChevronUp } from 'lucide-react';

interface PulseBarPersonalProps {
  onTap?: () => void;
  variant?: 'inline' | 'fixed' | 'floating';
}

export const PulseBarPersonal = ({ onTap }: PulseBarPersonalProps) => {
  const { state, refetch } = useHierarchyRank();
  const [displayValue, setDisplayValue] = useState(0);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [showPEGain, setShowPEGain] = useState(false);
  const [lastPE, setLastPE] = useState(0);

  // Valori dallo stato
  const progressPercent = state?.progressPercent ?? 0;
  const pulseEnergy = state?.pulseEnergy ?? 0;
  const currentLevel = state?.currentLevel;
  const nextLevel = state?.nextLevel;
  const peInCurrentLevel = state?.peInCurrentLevel ?? 0;
  const peNeededForLevel = state?.peNeededForLevel ?? 0;
  const peToNextLevel = state?.peToNextLevel ?? 0;
  const isMaxLevel = state?.isMaxLevel ?? false;

  // Refetch on PE award
  useEffect(() => {
    const handlePEAward = (e: CustomEvent) => {
      if (e.detail?.success) {
        refetch();
        setTimeout(() => refetch(), 500);
      }
    };
    window.addEventListener('pe:awarded', handlePEAward as EventListener);
    return () => window.removeEventListener('pe:awarded', handlePEAward as EventListener);
  }, [refetch]);

  // Show PE gain animation
  useEffect(() => {
    if (pulseEnergy > lastPE && lastPE > 0) {
      setShowPEGain(true);
      setTimeout(() => setShowPEGain(false), 2500);
    }
    setLastPE(pulseEnergy);
  }, [pulseEnergy, lastPE]);

  // Smooth counter animation
  useEffect(() => {
    const target = Math.round(progressPercent);
    if (displayValue !== target) {
      const timer = setTimeout(() => {
        setDisplayValue(prev => prev < target ? prev + 1 : prev - 1);
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [progressPercent, displayValue]);

  if (!PULSE_ENABLED) return null;

  const totalSegments = 24;
  const filledSegments = Math.floor((progressPercent / 100) * totalSegments);
  
  // Colore basato sul rank
  const rankColor = currentLevel?.color || '#00e7ff';

  // Handler per aprire il gioco quando si clicca sulla barra
  const handleBarClick = () => {
    if (onTap) {
      onTap();
    } else {
      setIsGameOpen(true);
    }
  };

  // Formatta PE per display compatto
  const formatPE = (pe: number) => {
    if (pe >= 1000000) return `${(pe / 1000000).toFixed(1)}M`;
    if (pe >= 1000) return `${(pe / 1000).toFixed(1)}K`;
    return pe.toString();
  };

  return (
    <motion.div
      className="relative w-full flex items-center gap-3 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleBarClick}
    >
      {/* === CIRCULAR GAUGE (Left) - Con Rank Icon === */}
      <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          {/* Outermost ring */}
          <circle cx="32" cy="32" r="31" fill="none" stroke={rankColor} strokeWidth="1" opacity="0.3" />
          {/* Second ring */}
          <circle cx="32" cy="32" r="28" fill="none" stroke={rankColor} strokeWidth="1" opacity="0.5" />
          {/* Progress ring background */}
          <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          {/* Progress arc */}
          <motion.circle
            cx="32" cy="32" r="24"
            fill="none"
            stroke={rankColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 24}
            strokeDashoffset={2 * Math.PI * 24 * (1 - progressPercent / 100)}
            transform="rotate(-90 32 32)"
            style={{ filter: `drop-shadow(0 0 6px ${rankColor})` }}
            initial={false}
            animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - progressPercent / 100) }}
            transition={{ duration: 0.5 }}
          />
          {/* Inner ring */}
          <circle cx="32" cy="32" r="19" fill="none" stroke={rankColor} strokeWidth="1" opacity="0.3" />
        </svg>
        
        {/* Rank Icon + Percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl leading-none">{currentLevel?.icon || '❓'}</span>
          <span 
            className="font-bold font-mono text-[10px] mt-0.5"
            style={{ 
              color: rankColor,
              textShadow: `0 0 8px ${rankColor}`,
            }}
          >
            {displayValue}%
          </span>
        </div>

        {/* Rotating dot */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div 
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: rankColor,
              boxShadow: `0 0 6px ${rankColor}, 0 0 12px ${rankColor}`,
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </motion.div>
      </div>

      {/* === INFO + SEGMENTED BAR (Right) === */}
      <div className="flex-1 min-w-0">
        {/* Header: Rank + Level */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-black uppercase tracking-wider"
              style={{ color: rankColor, textShadow: `0 0 8px ${rankColor}` }}
            >
              {currentLevel?.name || 'Unranked'}
            </span>
            <span className="text-[10px] text-white/50 font-mono">
              LVL {currentLevel?.level || 0}
            </span>
          </div>
          
          {/* PE Totali — leggibilità: dimensione e contrasto aumentati */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white/80">PE</span>
            <span 
              className="text-sm font-bold font-mono tabular-nums"
              style={{ color: rankColor, textShadow: `0 0 10px ${rankColor}99` }}
            >
              {formatPE(pulseEnergy)}
            </span>
          </div>
        </div>

        {/* Segmented Bar */}
        <div 
          className="relative h-[18px] rounded-lg overflow-hidden"
          style={{
            background: 'rgba(0,20,30,0.9)',
            border: `1px solid ${rankColor}33`,
          }}
        >
          {/* Segments */}
          <div className="absolute inset-1 flex gap-[2px]">
            {[...Array(totalSegments)].map((_, i) => {
              const isFilled = i < filledSegments;
              return (
                <motion.div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    background: isFilled 
                      ? `linear-gradient(180deg, ${rankColor} 0%, ${rankColor}99 50%, ${rankColor}66 100%)`
                      : 'rgba(255,255,255,0.05)',
                    boxShadow: isFilled ? `0 0 6px ${rankColor}` : 'none',
                  }}
                  initial={false}
                  animate={{ opacity: isFilled ? 1 : 0.3 }}
                  transition={{ duration: 0.2 }}
                />
              );
            })}
          </div>

          {/* Scanning effect */}
          <motion.div
            className="absolute top-0 bottom-0 w-10 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${rankColor}44, transparent)`,
            }}
            animate={{ left: ['-15%', '115%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Footer: PE in questo livello + Next Rank Badge */}
        <div className="flex items-center justify-between mt-1">
          {/* PE nel livello corrente — leggibilità migliorata */}
          <span className="text-xs text-white/70 font-mono tabular-nums">
            {formatPE(peInCurrentLevel)} / {formatPE(peNeededForLevel)} PE
          </span>
          
          {/* Next rank badge */}
          {nextLevel && !isMaxLevel ? (
            <div className="flex items-center gap-1 text-white/40">
              <ChevronUp className="w-3 h-3" />
              <span className="text-[10px]">
                {nextLevel.icon} {formatPE(peToNextLevel)}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-yellow-400/70">👑 MAX</span>
          )}
        </div>
      </div>

      {/* PE Gain Animation */}
      {showPEGain && pulseEnergy > lastPE && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-20"
          initial={{ opacity: 0, y: 5, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
        >
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-500/20 border border-emerald-400/50 text-emerald-400">
            ⚡ +{pulseEnergy - lastPE} PE
          </div>
        </motion.div>
      )}

      {/* 🏪 STORE COMPLIANCE: Game Modal (hidden on native) */}
      {isPulseBreakerEnabled() && (
        <PulseBreaker 
          isOpen={isGameOpen} 
          onClose={() => setIsGameOpen(false)} 
        />
      )}
    </motion.div>
  );
};

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
