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
  
  // Map value to living organism parameters
  const flowSpeed = value < 25 ? '6s' : value < 50 ? '4s' : value < 75 ? '3s' : '2.5s';
  const brightness = value < 25 ? 0.7 : value < 50 ? 0.85 : value < 75 ? 1 : 1.1;
  const pulseScale = value < 25 ? 1 : value < 50 ? 1.01 : value < 75 ? 1.02 : 1.03;
  const outlineIntensity = value < 25 ? 0.7 : value < 50 ? 0.9 : value < 75 ? 1.1 : 1.3;
  const breathSpeed = value < 25 ? '2.5s' : value < 50 ? '2s' : value < 75 ? '1.6s' : '1.2s';
  
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
  
  // Random energy spikes every 20-40s
  useEffect(() => {
    if (reduceMotion) return;
    
    const triggerSpike = () => {
      const root = document.documentElement;
      root.style.setProperty('--flow-speed', '1.2s');
      root.style.setProperty('--pulse-brightness', '1.3');
      
      setTimeout(() => {
        root.style.setProperty('--flow-speed', flowSpeed);
        root.style.setProperty('--pulse-brightness', String(brightness));
      }, 1500);
    };
    
    const interval = setInterval(triggerSpike, Math.random() * 20000 + 20000);
    return () => clearInterval(interval);
  }, [flowSpeed, brightness, reduceMotion]);

  return (
    <motion.div
      className={`${variant === 'fixed' ? 'fixed top-0 left-0 right-0 safe-area-inset-top' : 'relative w-full'} z-[120]`}
      initial={variant === 'fixed' ? { y: -100 } : { opacity: 0 }}
      animate={variant === 'fixed' ? { y: 0 } : { opacity: 1 }}
      transition={{ type: 'spring', damping: 20 }}
      onClick={onTap}
      style={{ cursor: onTap ? 'pointer' : 'default' }}
    >
      {/* Energy Bar Container — Living Organism */}
      <motion.div 
        className="relative w-full h-[14px] rounded-full overflow-hidden shadow-[0_0_25px_rgba(0,231,255,0.4)]"
        animate={showSurge ? {
          scale: [1, 1.03, 1],
          boxShadow: [
            '0 0 25px rgba(0,231,255,0.4)',
            '0 0 40px rgba(255,77,240,0.9)',
            '0 0 25px rgba(0,231,255,0.4)'
          ]
        } : {}}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      >
        {/* ENERGY FLOW — Breathing Gradient */}
        <div 
          className={reduceMotion ? '' : 'animate-energyFlow'}
          style={{ 
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(270deg, #ff4df0, #00eaff, #e0ffff, #00eaff, #ff4df0)',
            backgroundSize: '400% 400%',
            ['--flow-speed' as any]: flowSpeed,
            ['--pulse-brightness' as any]: brightness
          }} 
        />
        
        {/* GLOW / BREATH — Pulsing Life */}
        <motion.div 
          className={reduceMotion ? '' : 'animate-pulseBreath'}
          style={{ 
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, transparent 80%)',
            ['--pulse-scale' as any]: pulseScale,
            ['--breath-speed' as any]: breathSpeed
          }}
        />

        {/* OUTLINE ENERGY — Living Border */}
        <div 
          className={reduceMotion ? '' : 'animate-outlineFlux'}
          style={{ 
            position: 'absolute',
            inset: 0,
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 0 12px rgba(0,200,255,0.5)',
            ['--outline-intensity' as any]: outlineIntensity,
            ['--outline-speed' as any]: breathSpeed
          }}
        />

        {/* Percentage — Clean & Glowing */}
        <div className="absolute inset-0 flex items-center justify-end pr-3">
          <motion.span 
            className="text-[0.8rem] font-mono font-bold text-white tracking-wide tabular-nums drop-shadow-[0_0_8px_rgba(0,231,255,0.8)]"
            style={{ textShadow: '0 0 10px rgba(0,231,255,0.9), 0 0 14px rgba(255,77,240,0.6)' }}
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            key={value}
          >
            {Math.round(value)}%
          </motion.span>
        </div>
        
        {/* Threshold Surge Particles */}
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
