/**
 * CLUE MILESTONE MODAL™ — Popup di celebrazione
 * Mostra quando l'utente raggiunge una milestone degli indizi
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Sparkles, Coins } from 'lucide-react';
import type { ClueMilestone } from '@/hooks/useClueMilestones';

interface ClueMilestoneModalProps {
  milestone: ClueMilestone | null;
  onClose: () => void;
}

export const ClueMilestoneModal: React.FC<ClueMilestoneModalProps> = ({ milestone, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (milestone) {
      setShowConfetti(true);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [milestone, onClose]);

  if (!milestone || !milestone.title) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Confetti particles */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ['#00D1FF', '#D946EF', '#22C55E', '#F59E0B', '#EF4444'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                }}
                initial={{ y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  y: '120vh',
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 720 - 360,
                  x: Math.random() * 100 - 50,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}

        {/* Modal Content */}
        <motion.div
          className="relative w-full max-w-sm rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 30, 0.98) 100%)',
            border: '2px solid rgba(0, 209, 255, 0.4)',
            boxShadow: '0 0 60px rgba(0, 209, 255, 0.3), 0 0 120px rgba(217, 70, 239, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow effect top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon with glow */}
            <motion.div
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.2) 0%, rgba(217, 70, 239, 0.2) 100%)',
                border: '2px solid rgba(0, 209, 255, 0.5)',
                boxShadow: '0 0 40px rgba(0, 209, 255, 0.4)',
              }}
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 40px rgba(0, 209, 255, 0.4)',
                  '0 0 60px rgba(0, 209, 255, 0.6)',
                  '0 0 40px rgba(0, 209, 255, 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-12 h-12 text-cyan-400" />
            </motion.div>

            {/* Level Up text */}
            <motion.div
              className="text-sm font-bold tracking-[0.3em] text-cyan-400 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              LEVEL UP
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-3xl font-orbitron font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, #00D1FF 0%, #D946EF 50%, #00D1FF 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 3s ease infinite',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              {milestone.title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              className="text-white/60 text-sm mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Hai raggiunto <span className="text-green-400 font-bold">{milestone.threshold}</span> indizi trovati!
            </motion.p>

            {/* M1U Reward */}
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(0, 209, 255, 0.15) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Coins className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold text-green-400">+{milestone.m1u} M1U</span>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </motion.div>

            {/* Animation keyframes */}
            <style>{`
              @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
            `}</style>
          </div>

          {/* Bottom glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-gradient-to-t from-cyan-500/20 to-transparent blur-xl pointer-events-none" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™



