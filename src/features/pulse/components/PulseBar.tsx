/**
 * THE PULSE™ — Living Energy Bar (ORIGINALE)
 * Barra viva con gradient animato cyan/magenta — SENZA CONTAINER
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { usePulseRealtime } from '../hooks/usePulseRealtime';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PULSE_ENABLED } from '@/config/featureFlags';

interface PulseBarProps {
  onTap?: () => void;
  variant?: 'inline' | 'fixed' | 'floating';
}

export const PulseBar = ({ onTap, variant = 'inline' }: PulseBarProps) => {
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

  if (!PULSE_ENABLED) return null;

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onClick={onTap}
      style={{ cursor: onTap ? 'pointer' : 'default' }}
    >
      {/* Energy Bar — Living Organism — NO CONTAINER */}
      <motion.div 
        className="relative w-full h-[12px] rounded-full overflow-hidden"
        style={{
          boxShadow: '0 0 20px rgba(0,231,255,0.5), 0 0 40px rgba(255,77,240,0.3)',
        }}
        animate={showSurge ? {
          scale: [1, 1.03, 1],
          boxShadow: [
            '0 0 20px rgba(0,231,255,0.5)',
            '0 0 50px rgba(255,77,240,0.9)',
            '0 0 20px rgba(0,231,255,0.5)'
          ]
        } : {}}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      >
        {/* ENERGY FLOW — Breathing Gradient */}
        <motion.div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(270deg, #ff4df0, #00eaff, #e0ffff, #00eaff, #ff4df0)',
            backgroundSize: '400% 400%',
            filter: `brightness(${brightness})`,
          }}
          animate={reduceMotion ? {} : {
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: parseFloat(flowSpeed),
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* GLOW / BREATH — Pulsing Life */}
        <motion.div 
          className="absolute inset-0"
          style={{ 
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
          }}
          animate={reduceMotion ? {} : {
            scale: [1, pulseScale, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: parseFloat(breathSpeed),
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* OUTLINE ENERGY — Living Border Glow */}
        <motion.div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ 
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: `inset 0 0 10px rgba(0,200,255,${0.3 * outlineIntensity})`,
          }}
          animate={reduceMotion ? {} : {
            boxShadow: [
              `inset 0 0 10px rgba(0,200,255,${0.3 * outlineIntensity})`,
              `inset 0 0 15px rgba(255,77,240,${0.4 * outlineIntensity})`,
              `inset 0 0 10px rgba(0,200,255,${0.3 * outlineIntensity})`,
            ],
          }}
          transition={{
            duration: parseFloat(breathSpeed),
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Percentage — Clean & Glowing */}
        <div className="absolute inset-0 flex items-center justify-end pr-3">
          <motion.span 
            className="text-[10px] font-mono font-bold text-white tracking-wider tabular-nums"
            style={{ 
              textShadow: '0 0 8px rgba(0,231,255,0.9), 0 0 12px rgba(255,77,240,0.6)',
              filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))',
            }}
            key={value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {Math.round(value)}%
          </motion.span>
        </div>
        
        {/* Threshold Surge Flash */}
        <AnimatePresence>
          {showSurge && !reduceMotion && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,transparent_60%)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
