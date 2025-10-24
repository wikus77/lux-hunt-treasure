/**
 * THE PULSE™ — Pulse Bar (Living Energy Bar)
 * Barra viva collegata al backend con animazioni dinamiche, soglie e realtime
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { usePulseRealtime } from '../hooks/usePulseRealtime';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface PulseBarProps {
  onTap?: () => void;
  variant?: 'inline' | 'fixed';
}

export const PulseBar = ({ onTap, variant = 'fixed' }: PulseBarProps) => {
  const { pulseState, lastUpdate } = usePulseRealtime();
  const [showSurge, setShowSurge] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const value = pulseState?.value ?? 0;
  
  // Map value to animation intensity
  const getAnimationSpeed = (val: number) => {
    if (val >= 75) return '3s';
    if (val >= 50) return '4s';
    if (val >= 25) return '5s';
    return '6s';
  };
  
  const glowIntensity = value > 80 ? 1 : value > 50 ? 0.8 : value > 25 ? 0.6 : 0.4;
  const flowSpeed = getAnimationSpeed(value);
  
  // Check accessibility preference
  useEffect(() => {
    const prefersReducedMotion = localStorage.getItem('pulse_reduce_motion') === 'true';
    setReduceMotion(prefersReducedMotion);
  }, []);
  
  // Threshold surge effect
  useEffect(() => {
    if (lastUpdate?.threshold && !reduceMotion) {
      setShowSurge(true);
      const timer = setTimeout(() => setShowSurge(false), 900);
      return () => clearTimeout(timer);
    }
  }, [lastUpdate?.threshold, reduceMotion]);

  return (
    <motion.div
      className={`${variant === 'fixed' ? 'fixed top-0 left-0 right-0 safe-area-inset-top' : 'relative w-full'} z-[120]`}
      initial={variant === 'fixed' ? { y: -100 } : { opacity: 0 }}
      animate={variant === 'fixed' ? { y: 0 } : { opacity: 1 }}
      transition={{ type: 'spring', damping: 20 }}
      onClick={onTap}
      style={{ cursor: onTap ? 'pointer' : 'default' }}
    >
      {/* Energy Bar Container with Threshold Surge */}
      <motion.div 
        className="relative w-full h-[14px] rounded-full overflow-hidden shadow-[0_0_25px_rgba(0,231,255,0.5)]"
        animate={showSurge ? {
          scale: [1, 1.03, 1],
          boxShadow: [
            '0 0 25px rgba(0,231,255,0.5)',
            '0 0 40px rgba(255,77,240,0.9)',
            '0 0 25px rgba(0,231,255,0.5)'
          ]
        } : {}}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      >
        {/* Animated Gradient Background - Vivid Energy Colors */}
        <div 
          className={reduceMotion ? '' : 'animate-energyFlow'}
          style={{ 
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(270deg, #ff4df0, #00eaff, #e0ffff, #00eaff, #ff4df0)',
            backgroundSize: '300% 300%',
            animationDuration: flowSpeed
          }} 
        />
        
        {/* Pulsing Glow Overlay - Breathing Effect */}
        <motion.div 
          className={reduceMotion ? '' : 'animate-pulseGlow'}
          style={{ 
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.35) 0%, transparent 75%)',
            opacity: glowIntensity,
            filter: value > 80 ? 'drop-shadow(0 0 10px rgba(255,0,255,0.8))' : 'none'
          }}
        />

        {/* Percentage Only - Clean & Elegant */}
        <div className="absolute inset-0 flex items-center justify-end pr-3">
          <motion.span 
            className="text-[0.85rem] font-mono font-bold text-white tabular-nums drop-shadow-[0_0_6px_rgba(0,231,255,0.9)]"
            style={{ textShadow: '0 0 8px rgba(0,231,255,0.9), 0 0 12px rgba(255,77,240,0.5)' }}
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            key={value} // Re-animate on value change
          >
            {Math.round(value)}%
          </motion.span>
        </div>

        {/* Outer Glow Effect - Enhanced Aura */}
        <div 
          className={`absolute -inset-1 blur-md -z-10 ${reduceMotion ? '' : 'animate-energyFlow'}`}
          style={{ 
            background: 'linear-gradient(270deg, rgba(255,77,240,0.3), rgba(0,234,255,0.3), rgba(255,77,240,0.3))',
            backgroundSize: '300% 300%',
            animationDuration: flowSpeed
          }} 
        />
        
        {/* Threshold Surge Particles (optional visual burst) */}
        <AnimatePresence>
          {showSurge && !reduceMotion && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6)_0%,transparent_60%)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
