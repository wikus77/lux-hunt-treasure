/**
 * THE PULSE™ — Cyberpunk Energy Bar (Faithful Recreation)
 * Design identico al riferimento sci-fi
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { usePulseRealtime } from '../hooks/usePulseRealtime';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PULSE_ENABLED } from '@/config/featureFlags';
import { Gamepad2 } from 'lucide-react';
import { PulseBreaker } from '@/features/pulse-breaker';

interface PulseBarProps {
  onTap?: () => void;
  variant?: 'inline' | 'fixed' | 'floating';
}

export const PulseBar = ({ onTap }: PulseBarProps) => {
  const { pulseState, refetch } = usePulseRealtime();
  const [displayValue, setDisplayValue] = useState(0);
  const [isGameOpen, setIsGameOpen] = useState(false);

  const value = pulseState?.value ?? 0;

  // Refetch on contribution
  useEffect(() => {
    const handleContribution = (e: CustomEvent) => {
      if (e.detail?.accepted) {
        refetch();
        setTimeout(() => refetch(), 500);
        setTimeout(() => refetch(), 1500);
      }
    };
    window.addEventListener('pulse:contributed', handleContribution as EventListener);
    return () => window.removeEventListener('pulse:contributed', handleContribution as EventListener);
  }, [refetch]);

  // Smooth counter
  useEffect(() => {
    const target = Math.round(value);
    if (displayValue !== target) {
      const timer = setTimeout(() => {
        setDisplayValue(prev => prev < target ? prev + 1 : prev - 1);
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  if (!PULSE_ENABLED) return null;

  const totalSegments = 24;
  const filledSegments = Math.floor((value / 100) * totalSegments);
  const cyan = '#00e7ff';

  return (
    <motion.div
      className="relative w-full flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onTap}
      style={{ cursor: onTap ? 'pointer' : 'default' }}
    >
      {/* === CIRCULAR GAUGE (Left) === */}
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
            strokeDashoffset={2 * Math.PI * 20 * (1 - value / 100)}
            transform="rotate(-90 28 28)"
            style={{ filter: `drop-shadow(0 0 4px ${cyan})` }}
            transition={{ duration: 0.5 }}
          />
          {/* Inner ring */}
          <circle cx="28" cy="28" r="16" fill="none" stroke={cyan} strokeWidth="1" opacity="0.3" />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="font-bold font-mono text-sm"
            style={{ 
              color: cyan,
              textShadow: `0 0 10px ${cyan}, 0 0 20px ${cyan}`,
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
        {/* Label */}
        <div className="flex items-center gap-1 mb-0.5">
          <span 
            className="text-[9px] font-bold tracking-[0.15em]"
            style={{ color: cyan, textShadow: `0 0 6px ${cyan}` }}
          >
            PULSE
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

      {/* PLAY Button */}
      <motion.button
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0, 231, 255, 0.2) 0%, rgba(0, 100, 150, 0.3) 100%)',
          border: `2px solid ${cyan}`,
          boxShadow: `0 0 12px rgba(0, 231, 255, 0.4), inset 0 0 8px rgba(0, 231, 255, 0.1)`,
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.1, boxShadow: `0 0 20px rgba(0, 231, 255, 0.6)` }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsGameOpen(true);
        }}
        title="PULSE BREAKER"
      >
        <Gamepad2 
          size={18} 
          style={{ 
            color: cyan,
            filter: `drop-shadow(0 0 4px ${cyan})`,
          }} 
        />
      </motion.button>

      {/* Game Modal */}
      <PulseBreaker 
        isOpen={isGameOpen} 
        onClose={() => setIsGameOpen(false)} 
      />
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
