/**
 * Battle Result Modal - Victory or Defeat screen
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Skull, Zap } from 'lucide-react';

interface BattleResultModalProps {
  isOpen: boolean;
  won: boolean;
  attackerName: string;
  defenderName: string;
  stakePercent: number;
  stakeType: string;
  onClose: () => void;
}

export function BattleResultModal({
  isOpen,
  won,
  attackerName,
  defenderName,
  stakePercent,
  stakeType,
  onClose,
}: BattleResultModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[4000] bg-black/90 backdrop-blur-md flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`relative p-8 rounded-3xl text-center max-w-md mx-4 ${
            won 
              ? 'bg-gradient-to-br from-green-900/80 via-emerald-900/60 to-cyan-900/80' 
              : 'bg-gradient-to-br from-red-900/80 via-rose-900/60 to-purple-900/80'
          }`}
          style={{
            border: won ? '2px solid #10b981' : '2px solid #ef4444',
            boxShadow: won 
              ? '0 0 60px rgba(16, 185, 129, 0.4), 0 0 120px rgba(16, 185, 129, 0.2)' 
              : '0 0 60px rgba(239, 68, 68, 0.4), 0 0 120px rgba(239, 68, 68, 0.2)',
          }}
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          {/* Confetti/particles for victory */}
          {won && (
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#10b981', '#00d4ff', '#ffd700', '#ff00ff'][i % 4],
                    left: `${Math.random() * 100}%`,
                    top: '-10px',
                  }}
                  animate={{
                    y: [0, 400],
                    x: [0, (Math.random() - 0.5) * 100],
                    opacity: [1, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          )}

          {/* Icon */}
          <motion.div
            className="text-8xl mb-6"
            animate={won ? { 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            } : {
              scale: [1, 0.9, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {won ? '🏆' : '💀'}
          </motion.div>

          {/* Title */}
          <motion.h1
            className={`text-5xl font-bold mb-4 ${won ? 'text-green-400' : 'text-red-400'}`}
            style={{
              textShadow: won 
                ? '0 0 20px rgba(16, 185, 129, 0.8)' 
                : '0 0 20px rgba(239, 68, 68, 0.8)',
              fontFamily: 'Orbitron, sans-serif',
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {won ? 'VICTORY!' : 'DEFEATED!'}
          </motion.h1>

          {/* Message */}
          <motion.p
            className="text-white/80 text-lg mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {won 
              ? `You destroyed ${defenderName}!`
              : `${defenderName} defended successfully!`}
          </motion.p>

          {/* Stake result */}
          <motion.div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${
              won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <Zap className="h-5 w-5" />
            <span className="font-bold text-lg">
              {won ? '+' : '-'}{stakePercent}% {stakeType}
            </span>
          </motion.div>

          {/* Close button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onClose}
              className={`w-full h-12 text-lg font-bold ${
                won 
                  ? 'bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600' 
                  : 'bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600'
              }`}
            >
              {won ? 'Claim Victory!' : 'Continue'}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

