/**
 * TRON BATTLE - Animated TRON Disc Component
 * Rotating 3D-style disc with neon cyan glow
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface TronDiscProps {
  isActive?: boolean;
  isFlashing?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function TronDisc({ isActive, isFlashing, onClick, disabled }: TronDiscProps) {
  return (
    <motion.div
      className="relative w-64 h-64 cursor-pointer select-none"
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.1 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={{
        rotate: isActive ? 360 : 0,
        scale: isFlashing ? [1, 1.2, 1] : 1,
      }}
      transition={{
        rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
        scale: isFlashing ? { duration: 0.5, repeat: 3 } : {},
      }}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-purple-500/30 blur-xl"
        animate={{
          opacity: isFlashing ? [0.5, 1, 0.5] : [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main disc */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 shadow-2xl shadow-cyan-500/50">
        {/* Inner rings */}
        <div className="absolute inset-4 rounded-full border-4 border-cyan-400/50" />
        <div className="absolute inset-8 rounded-full border-2 border-blue-400/30" />
        <div className="absolute inset-12 rounded-full bg-gradient-to-br from-cyan-600/80 to-blue-700/80" />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              rotate: isActive ? -360 : 0,
              scale: isFlashing ? [1, 1.3, 1] : 1,
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            }}
          >
            <Zap className="w-16 h-16 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          </motion.div>
        </div>

        {/* Rotating energy lines */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-blue-300 to-transparent" />
        </motion.div>

        {/* Pulse effect on flash */}
        {isFlashing && (
          <motion.div
            className="absolute inset-0 rounded-full bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.6, times: [0, 0.5, 1] }}
          />
        )}
      </div>

      {/* Hit prompt */}
      {isActive && !disabled && (
        <motion.div
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-cyan-400 font-bold text-xl tracking-wider"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: [0.5, 1, 0.5], y: 0 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          TAP NOW!
        </motion.div>
      )}
    </motion.div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
