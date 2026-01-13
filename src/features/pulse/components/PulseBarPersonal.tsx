/**
 * THE PULSE™ — Personal Energy Bar (PER UTENTE)
 * Design identico alla PulseBar originale ma con dati PE per utente
 * Mostra il progresso verso il prossimo rank
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useAgentEnergy } from '../hooks/useAgentEnergy';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PULSE_ENABLED } from '@/config/featureFlags';
import { PulseBreaker } from '@/features/pulse-breaker';

interface PulseBarPersonalProps {
  onTap?: () => void;
  variant?: 'inline' | 'fixed' | 'floating';
}

export const PulseBarPersonal = ({ onTap }: PulseBarPersonalProps) => {
  const { energy, refetch, lastDelta } = useAgentEnergy();
  const [displayValue, setDisplayValue] = useState(0);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [showPEGain, setShowPEGain] = useState(false);

  // Valori dall'hook
  const progressPercent = energy?.progressToNextRank ?? 0;
  const pulseEnergy = energy?.pulseEnergy ?? 0;
  const rank = energy?.rank;
  const nextRank = energy?.nextRank;
  const peToNext = energy?.peToNextRank ?? 0;

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
    if (lastDelta && lastDelta > 0) {
      setShowPEGain(true);
      setTimeout(() => setShowPEGain(false), 2500);
    }
  }, [lastDelta]);

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
  
  // Colore basato sul rank (o cyan di default)
  const rankColor = rank?.color || '#00e7ff';
  const cyan = rankColor;

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
      className="relative w-full flex items-center gap-2 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleBarClick}
    >
      {/* === CIRCULAR GAUGE (Left) - Con Rank Symbol === */}
      <div className="relative flex-shrink-0" style={{ width: 56, height: 56 }}>
        {/* Outer double ring */}
        <svg width="56" height="56" viewBox="0 0 56 56">
          {/* Outermost ring */}
          <circle cx="28" cy="28" r="27" fill="none" stroke={cyan} strokeWidth="1" opacity="0.4" />
          {/* Second ring */}
          <circle cx="28" cy="28" r="24" fill="none" stroke={cyan} strokeWidth="1" opacity="0.6" />
          {/* Main progress ring background */}
          <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(0,231,255,0.15)" strokeWidth="3" />
          {/* Progress arc */}
          <motion.circle
            cx="28" cy="28" r="20"
            fill="none"
            stroke={cyan}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 20}
            strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercent / 100)}
            transform="rotate(-90 28 28)"
            style={{ filter: `drop-shadow(0 0 4px ${cyan})` }}
            transition={{ duration: 0.5 }}
          />
          {/* Inner ring */}
          <circle cx="28" cy="28" r="16" fill="none" stroke={cyan} strokeWidth="1" opacity="0.3" />
        </svg>
        
        {/* Rank Symbol + Percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg leading-none">{rank?.symbol || '🔰'}</span>
          <span 
            className="font-bold font-mono text-[10px]"
            style={{ 
              color: cyan,
              textShadow: `0 0 8px ${cyan}`,
              letterSpacing: '-0.5px'
            }}
          >
            {displayValue}%
          </span>
        </div>

        {/* Rotating dot */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        >
          <div 
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: cyan,
              boxShadow: `0 0 6px ${cyan}, 0 0 12px ${cyan}`,
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </motion.div>
      </div>

      {/* === SEGMENTED BAR (Right) === */}
      <div className="flex-1 relative">
        {/* Label con PE totali e rank */}
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1">
            <span 
              className="text-[9px] font-bold tracking-[0.15em]"
              style={{ color: cyan, textShadow: `0 0 6px ${cyan}` }}
            >
              PE
            </span>
            <span 
              className="text-[10px] font-mono font-bold"
              style={{ color: cyan }}
            >
              {formatPE(pulseEnergy)}
            </span>
            <motion.span
              style={{ color: cyan }}
              className="text-[8px]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ●
            </motion.span>
          </div>
          
          {/* Next rank info */}
          {nextRank && (
            <span className="text-[8px] text-white/40 font-mono">
              → {nextRank.symbol} {formatPE(peToNext)}
            </span>
          )}
        </div>

        {/* Bar container - trapezoid shape */}
        <div 
          className="relative h-[16px]"
          style={{
            background: 'rgba(0,20,30,0.9)',
            clipPath: 'polygon(0 0, 100% 0, 96% 100%, 0 100%)',
            border: `1px solid ${cyan}33`,
          }}
        >
          {/* Segments container */}
          <div className="absolute inset-[2px] flex gap-[2px]" style={{ clipPath: 'polygon(0 0, 100% 0, 97% 100%, 0 100%)' }}>
            {[...Array(totalSegments)].map((_, i) => {
              const isFilled = i < filledSegments;
              return (
                <motion.div
                  key={i}
                  className="flex-1 relative"
                  style={{
                    background: isFilled 
                      ? `linear-gradient(180deg, ${cyan} 0%, ${cyan}99 50%, ${cyan}66 100%)`
                      : 'rgba(0,231,255,0.08)',
                    transform: 'skewX(-20deg)',
                    transformOrigin: 'bottom',
                    boxShadow: isFilled ? `0 0 4px ${cyan}` : 'none',
                  }}
                  initial={false}
                  animate={{ 
                    opacity: isFilled ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.2, delay: i * 0.01 }}
                >
                  {/* Shine effect */}
                  {isFilled && (
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
                      }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Scanning line */}
          <motion.div
            className="absolute top-0 bottom-0 w-8 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${cyan}44, transparent)`,
            }}
            animate={{ left: ['-10%', '110%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Top edge highlight */}
          <div 
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: `linear-gradient(90deg, ${cyan}66, ${cyan}22)` }}
          />
        </div>

        {/* Right decorative bracket */}
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1"
          style={{ 
            width: 6, 
            height: 20,
            borderRight: `2px solid ${cyan}`,
            borderTop: `2px solid ${cyan}`,
            borderBottom: `2px solid ${cyan}`,
            opacity: 0.5,
          }}
        />
      </div>

      {/* PE Gain Animation */}
      {showPEGain && lastDelta && lastDelta > 0 && (
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-20"
          initial={{ opacity: 0, y: 5, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
        >
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/50 text-emerald-400">
            ⚡ +{lastDelta} PE
          </div>
        </motion.div>
      )}

      {/* Game Modal */}
      <PulseBreaker 
        isOpen={isGameOpen} 
        onClose={() => setIsGameOpen(false)} 
      />
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

