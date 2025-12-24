/**
 * CLUE MILESTONE MODAL™ — Popup di celebrazione LEVEL UP
 * Stile uguale ai popup delle micro-mission, con barra progressiva
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Zap, Star } from 'lucide-react';
import type { ClueMilestone } from '@/hooks/useClueMilestones';

interface ClueMilestoneModalProps {
  milestone: ClueMilestone | null;
  onClose: () => void;
}

// Fasi dell'animazione
type AnimationPhase = 'progress' | 'levelup' | 'rewards' | 'done';

export const ClueMilestoneModal: React.FC<ClueMilestoneModalProps> = ({ milestone, onClose }) => {
  const [phase, setPhase] = useState<AnimationPhase>('progress');
  const [progress, setProgress] = useState(0);

  // Reset quando cambia milestone
  useEffect(() => {
    if (milestone) {
      setPhase('progress');
      setProgress(0);
      
      // 1️⃣ FASE PROGRESS: Barra si riempie (2 secondi)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2; // Incrementa del 2% ogni 40ms = 2 secondi totali
        });
      }, 40);

      return () => clearInterval(progressInterval);
    }
  }, [milestone]);

  // 2️⃣ Quando progress arriva a 100, passa a LEVEL UP
  useEffect(() => {
    if (progress >= 100 && phase === 'progress') {
      setTimeout(() => setPhase('levelup'), 200);
    }
  }, [progress, phase]);

  // 3️⃣ Dopo LEVEL UP, mostra rewards
  useEffect(() => {
    if (phase === 'levelup') {
      setTimeout(() => setPhase('rewards'), 1200);
    }
  }, [phase]);

  // 4️⃣ Dopo rewards, chiudi e triggera slot machine
  useEffect(() => {
    if (phase === 'rewards' && milestone) {
      const closeTimer = setTimeout(() => {
        setPhase('done');
        
        // Scroll in alto per vedere il pill M1U
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Dispatch evento per slot machine PRIMA di chiudere
        console.log('[ClueMilestoneModal] 🎰 Dispatching m1u-credited for slot machine');
        window.dispatchEvent(new CustomEvent('m1u-credited', {
          detail: { amount: milestone.m1u }
        }));
        
        // Chiudi modal dopo un breve delay
        setTimeout(onClose, 500);
      }, 2500);

      return () => clearTimeout(closeTimer);
    }
  }, [phase, milestone, onClose]);

  if (!milestone || !milestone.title) return null;

  const modalContent = (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop con blur */}
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Particelle confetti */}
          {phase === 'levelup' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: ['#00D1FF', '#D946EF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'][i % 6],
                    left: `${Math.random() * 100}%`,
                    top: '-5%',
                  }}
                  initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                  animate={{
                    y: '120vh',
                    opacity: [1, 1, 0],
                    rotate: Math.random() * 720 - 360,
                    x: Math.random() * 200 - 100,
                    scale: [1, 1.5, 0.5],
                  }}
                  transition={{
                    duration: 2.5 + Math.random() * 1.5,
                    delay: Math.random() * 0.3,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          )}

          {/* ✨ CARD PRINCIPALE - Stile Micro-Mission */}
          <motion.div
            className="relative w-full max-w-[340px] rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(10, 15, 30, 0.98) 0%, rgba(5, 10, 20, 0.99) 100%)',
              border: '2px solid rgba(0, 209, 255, 0.5)',
              boxShadow: `
                0 0 60px rgba(0, 209, 255, 0.4),
                0 0 120px rgba(217, 70, 239, 0.2),
                inset 0 1px 0 rgba(255,255,255,0.1),
                inset 0 -1px 0 rgba(0,0,0,0.3)
              `,
            }}
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Glow line top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            {/* Content */}
            <div className="p-6 text-center">
              
              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* FASE 1: BARRA PROGRESSIVA */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              {phase === 'progress' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  {/* Icon pulsante */}
                  <motion.div
                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.2) 0%, rgba(217, 70, 239, 0.2) 100%)',
                      border: '2px solid rgba(0, 209, 255, 0.4)',
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 0 20px rgba(0, 209, 255, 0.3)',
                        '0 0 40px rgba(0, 209, 255, 0.6)',
                        '0 0 20px rgba(0, 209, 255, 0.3)',
                      ],
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Trophy className="w-10 h-10 text-cyan-400" />
                  </motion.div>

                  {/* Testo threshold raggiunto */}
                  <div>
                    <p className="text-white/60 text-sm mb-1">TRAGUARDO RAGGIUNTO</p>
                    <p className="text-2xl font-bold text-white">
                      <span className="text-green-400">{milestone.threshold}</span> INDIZI TROVATI
                    </p>
                  </div>

                  {/* BARRA PROGRESSIVA */}
                  <div className="relative w-full h-4 rounded-full overflow-hidden bg-white/10">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #00D1FF 0%, #D946EF 50%, #22C55E 100%)',
                        boxShadow: '0 0 20px rgba(0, 209, 255, 0.6)',
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.05 }}
                    />
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>

                  <p className="text-cyan-400 text-sm font-mono">{progress}%</p>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* FASE 2: LEVEL UP! */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              {phase === 'levelup' && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                  className="space-y-4 py-4"
                >
                  {/* Big animated icon */}
                  <motion.div
                    className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(0, 209, 255, 0.3) 100%)',
                      border: '3px solid rgba(34, 197, 94, 0.6)',
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    <Star className="w-14 h-14 text-yellow-400" fill="currentColor" />
                  </motion.div>

                  {/* LEVEL UP text */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-sm font-bold tracking-[0.4em] text-cyan-400 mb-2">
                      🎉 CONGRATULAZIONI 🎉
                    </p>
                    <h2
                      className="text-4xl font-orbitron font-black"
                      style={{
                        background: 'linear-gradient(135deg, #22C55E 0%, #00D1FF 50%, #D946EF 100%)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'gradientShift 2s ease infinite',
                      }}
                    >
                      LEVEL UP!
                    </h2>
                  </motion.div>

                  {/* Title */}
                  <motion.p
                    className="text-xl font-bold text-white/90"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {milestone.title}
                  </motion.p>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* FASE 3: REWARDS */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              {phase === 'rewards' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5 py-2"
                >
                  {/* Title recap */}
                  <div>
                    <p className="text-sm tracking-[0.3em] text-cyan-400 mb-1">SEI ORA</p>
                    <h2 className="text-2xl font-orbitron font-bold text-white">
                      {milestone.title}
                    </h2>
                  </div>

                  {/* Rewards cards */}
                  <div className="flex flex-col gap-3">
                    {/* M1U Reward */}
                    <motion.div
                      className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl mx-auto"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(0, 209, 255, 0.2) 100%)',
                        border: '2px solid rgba(34, 197, 94, 0.5)',
                        boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)',
                      }}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Sparkles className="w-6 h-6 text-green-400" />
                      <span className="text-3xl font-black text-green-400">+{milestone.m1u} M1U</span>
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                    </motion.div>

                    {/* PE Reward */}
                    <motion.div
                      className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl mx-auto"
                      style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                        border: '2px solid rgba(168, 85, 247, 0.5)',
                        boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)',
                      }}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Zap className="w-6 h-6 text-purple-400" />
                      <span className="text-3xl font-black text-purple-400">+{milestone.pe} PE</span>
                      <Zap className="w-6 h-6 text-pink-400" />
                    </motion.div>
                  </div>

                  {/* Loading indicator */}
                  <motion.p
                    className="text-white/50 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Accredito in corso...
                  </motion.p>
                </motion.div>
              )}

            </div>

            {/* Bottom glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-gradient-to-t from-cyan-500/20 to-transparent blur-xl pointer-events-none" />
          </motion.div>

          {/* CSS Animation */}
          <style>{`
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Usa createPortal per renderizzare nel body (sopra tutto)
  return createPortal(modalContent, document.body);
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
