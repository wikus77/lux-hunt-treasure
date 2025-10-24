/**
 * THE PULSE™ — Pulse Bar (Slim Top Bar)
 * Barra slim sempre visibile in top safe-area, ottimizzata per PWA mobile
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { usePulseRealtime } from '../hooks/usePulseRealtime';
import { motion } from 'framer-motion';

interface PulseBarProps {
  onTap?: () => void;
  variant?: 'inline' | 'fixed';
}

export const PulseBar = ({ onTap, variant = 'fixed' }: PulseBarProps) => {
  const { pulseState } = usePulseRealtime();

  const value = pulseState?.value ?? 0;
  const glowIntensity = value > 80 ? 1 : value > 50 ? 0.8 : 0.6;

  return (
    <motion.div
      className={`${variant === 'fixed' ? 'fixed top-0 left-0 right-0 safe-area-inset-top' : 'relative w-full'} z-[120] backdrop-blur-md`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      onClick={onTap}
      style={{ cursor: onTap ? 'pointer' : 'default' }}
    >
      {/* Energy Bar Container */}
      <div className="relative w-full h-[14px] rounded-full overflow-hidden shadow-[0_0_25px_rgba(0,231,255,0.5)]">
        {/* Animated Gradient Background - Vivid Energy Colors */}
        <div 
          className="absolute inset-0 animate-energyFlow" 
          style={{ 
            background: 'linear-gradient(270deg, #ff4df0, #00eaff, #e0ffff, #00eaff, #ff4df0)',
            backgroundSize: '300% 300%'
          }} 
        />
        
        {/* Pulsing Glow Overlay - Breathing Effect */}
        <motion.div 
          className="absolute inset-0 animate-pulseGlow"
          style={{ 
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 80%)',
            opacity: glowIntensity,
            filter: value > 80 ? 'drop-shadow(0 0 10px rgba(255,0,255,0.8))' : 'none'
          }}
        />

        {/* Percentage Only - Clean & Elegant */}
        <div className="absolute inset-0 flex items-center justify-end pr-3">
          <span 
            className="text-[0.85rem] font-mono font-bold text-white tabular-nums drop-shadow-[0_0_6px_rgba(0,231,255,0.9)] transition-opacity duration-500"
            style={{ textShadow: '0 0 8px rgba(0,231,255,0.9), 0 0 12px rgba(255,77,240,0.5)' }}
          >
            {Math.round(value)}%
          </span>
        </div>

        {/* Outer Glow Effect - Enhanced Aura */}
        <div 
          className="absolute -inset-1 blur-md -z-10 animate-energyFlow" 
          style={{ 
            background: 'linear-gradient(270deg, rgba(255,77,240,0.3), rgba(0,234,255,0.3), rgba(255,77,240,0.3))',
            backgroundSize: '300% 300%'
          }} 
        />
      </div>
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
