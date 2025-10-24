/**
 * THE PULSE™ — Pulse Bar (Slim Top Bar)
 * Barra slim sempre visibile in top safe-area, ottimizzata per PWA mobile
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { usePulseRealtime } from '../hooks/usePulseRealtime';
import { Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PulseBarProps {
  onTap?: () => void;
}

export const PulseBar = ({ onTap }: PulseBarProps) => {
  const { pulseState, lastUpdate } = usePulseRealtime();

  const value = pulseState?.value ?? 0;
  const isThresholdMoment = lastUpdate?.threshold !== null && lastUpdate?.threshold !== undefined;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] safe-area-inset-top bg-background/80 backdrop-blur-md border-b border-border/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      onClick={onTap}
      style={{ cursor: onTap ? 'pointer' : 'default' }}
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* Icon + Label */}
        <div className="flex items-center gap-2 min-w-0">
          <Zap className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider truncate">
            The PULSE™
          </span>
        </div>

        {/* Value */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold text-primary tabular-nums">
            {Math.round(value)}%
          </span>

          {/* Threshold indicator */}
          <AnimatePresence>
            {isThresholdMoment && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', damping: 10 }}
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative max-w-[200px]">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${value}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 100 }}
          />

          {/* Glow effect */}
          {value > 0 && (
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary/30 blur-sm"
              animate={{ width: `${value}%` }}
              transition={{ type: 'spring', damping: 25 }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
