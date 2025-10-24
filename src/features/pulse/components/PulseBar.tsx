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
  const [visualValue, setVisualValue] = useState(0);

  const value = pulseState?.value ?? 0;
  
  // Map value to living organism parameters
  const flowSpeed = value < 25 ? '6s' : value < 50 ? '4.8s' : value < 75 ? '3.6s' : '3s';
  const breathSpeed = value < 25 ? '2.6s' : value < 50 ? '2.2s' : value < 75 ? '1.8s' : '1.5s';
  const brightness = value < 25 ? '0.85' : value < 50 ? '0.95' : value < 75 ? '1.05' : '1.15';
  const outlineIntensity = value < 25 ? '0.7' : value < 50 ? '0.9' : value < 75 ? '1.1' : '1.3';
  
  // Intro surge: 0 → 100% → real value (visual effect only)
  useEffect(() => {
    const t1 = setTimeout(() => setVisualValue(100), 30);
    const t2 = setTimeout(() => setVisualValue(Math.max(0, Math.min(100, value))), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Follow real value changes smoothly
  useEffect(() => {
    setVisualValue(Math.max(0, Math.min(100, value)));
  }, [value]);

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
  
  // Set CSS variables on :root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--flow-speed', flowSpeed);
    root.style.setProperty('--breath-speed', breathSpeed);
    root.style.setProperty('--pulse-brightness', brightness);
    root.style.setProperty('--outline-intensity', outlineIntensity);
  }, [flowSpeed, breathSpeed, brightness, outlineIntensity]);
  
  // Random energy spikes every 20-40s
  useEffect(() => {
    if (reduceMotion) return;
    
    const triggerSpike = () => {
      const root = document.documentElement;
      root.style.setProperty('--flow-mult', '0.6');
      root.style.setProperty('--glow-mult', '1.25');
      
      setTimeout(() => {
        root.style.setProperty('--flow-mult', '1');
        root.style.setProperty('--glow-mult', '1');
      }, 1200);
    };
    
    const interval = setInterval(triggerSpike, Math.floor(20000 + Math.random() * 20000));
    return () => clearInterval(interval);
  }, [reduceMotion]);

  return (
    <motion.div
      className={`${variant === 'fixed' ? 'fixed top-0 left-0 right-0 safe-area-inset-top' : 'relative w-full p-4 bg-card/30 backdrop-blur-sm rounded-xl border border-border/30'} z-[120]`}
      initial={variant === 'fixed' ? { y: -100 } : { opacity: 0, y: 10 }}
      animate={variant === 'fixed' ? { y: 0 } : { opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      onClick={onTap}
      style={{ cursor: onTap ? 'pointer' : 'default' }}
    >
      {/* Label for inline variant */}
      {variant === 'inline' && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-technovier text-muted-foreground tracking-wide uppercase">
            The Pulse™
          </span>
          <span className="text-xs font-technovier text-primary/70">
            Global Energy
          </span>
        </div>
      )}

      {/* Energy Bar Container — Living Organism with Real Progress */}
      <motion.div 
        className="relative w-full h-[14px] rounded-full overflow-hidden"
        animate={showSurge ? {
          scale: [1, 1.03, 1],
        } : {}}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      >
        {/* TRACK (dark, static background) */}
        <div className="absolute inset-0 bg-[rgba(12,16,24,0.6)] backdrop-blur-[2px]"></div>

        {/* FILL (visual progress with intro surge, width-based mask) */}
        <div 
          className="absolute inset-y-0 left-0 rounded-full overflow-hidden pulse-fill-transition will-change-transform"
          style={{ width: `${visualValue}%` }}
        >
          {/* Energy flowing INSIDE the fill */}
          <div 
            className={reduceMotion ? 'absolute inset-0 bg-[linear-gradient(270deg,#ff4df0,#00eaff,#e0ffff,#00eaff,#ff4df0)]' : 'absolute inset-0 animate-energyFlow bg-[linear-gradient(270deg,#ff4df0,#00eaff,#e0ffff,#00eaff,#ff4df0)]'}
          />
          
          {/* Breath / glow coherent with fill */}
          <div 
            className={reduceMotion ? '' : 'absolute inset-0 animate-pulseBreath bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.28)_0%,transparent_78%)]'}
          />
        </div>

        {/* CONTORNO VIVO sincronizzato alla barra */}
        <div
          className={reduceMotion ? 'absolute inset-0 rounded-full pointer-events-none border border-[rgba(255,255,255,0.3)]' : 'absolute inset-0 rounded-full pointer-events-none pulse-outline'}
          aria-hidden="true"
        />

        {/* PERCENTUALE (clean typography) */}
        <span className="pulse-percent absolute right-2 top-1/2 -translate-y-1/2
                         text-[0.8rem] font-technovier tracking-wide text-white/90
                         antialiased [text-rendering:optimizeLegibility]
                         drop-shadow-[0_0_6px_rgba(0,231,255,0.8)]">
          {Math.round(value)}%
        </span>
        
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
