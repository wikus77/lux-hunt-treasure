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
      <div className="relative w-full h-[12px] rounded-full overflow-hidden shadow-lg">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 animate-energyFlow bg-gradient-to-r from-pink-500 via-cyan-400 to-pink-500" 
             style={{ backgroundSize: '200% 200%' }} />
        
        {/* Pulsing Glow Overlay */}
        <motion.div 
          className="absolute inset-0 animate-pulseGlow"
          style={{ 
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.35) 0%, transparent 70%)',
            opacity: glowIntensity
          }}
        />

        {/* Percentage Only - Clean & Elegant */}
        <div className="absolute inset-0 flex items-center justify-end pr-3">
          <span className="text-xs font-mono font-bold text-white tabular-nums drop-shadow-[0_0_6px_rgba(0,231,255,0.9)]">
            {Math.round(value)}%
          </span>
        </div>

        {/* Outer Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-cyan-400/20 to-pink-500/20 blur-md -z-10 animate-energyFlow" 
             style={{ backgroundSize: '200% 200%' }} />
      </div>
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
