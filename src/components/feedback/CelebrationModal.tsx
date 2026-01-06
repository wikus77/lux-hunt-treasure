/**
 * M1SSION™ Celebration Modal
 * Major celebration overlay for milestone events
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameEvent, getEventCopy } from '@/gameplay/events';

interface CelebrationModalProps {
  event: GameEvent;
  onDismiss: () => void;
  onCtaClick: (path: string) => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  event,
  onDismiss,
  onCtaClick,
}) => {
  const copy = getEventCopy(event);
  const animationRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  
  // Trigger confetti on mount with proper cleanup
  useEffect(() => {
    isMountedRef.current = true;
    const duration = 2000;
    const end = Date.now() + duration;
    
    const colors = getConfettiColors(event.type);
    
    const frame = () => {
      // 🛡️ Cleanup check: stop if unmounted
      if (!isMountedRef.current) return;
      
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      
      if (Date.now() < end && isMountedRef.current) {
        animationRef.current = requestAnimationFrame(frame);
      }
    };
    
    frame();
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 100]);
    }
    
    // 🛡️ Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [event.type]);
  
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);
  
  // Handle CTA click
  const handleCta = useCallback(() => {
    if (copy.cta) {
      onCtaClick(copy.cta.path);
    } else {
      onDismiss();
    }
  }, [copy.cta, onCtaClick, onDismiss]);
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onDismiss()}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        
        {/* Modal Content */}
        <motion.div
          className="relative mx-4 max-w-md w-full rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            border: '2px solid rgba(0, 229, 255, 0.4)',
            boxShadow: '0 0 60px rgba(0, 229, 255, 0.3), 0 0 120px rgba(123, 92, 255, 0.2)',
          }}
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        >
          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
          
          {/* Content */}
          <div className="p-6 text-center">
            {/* Icon */}
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              {copy.icon}
            </motion.div>
            
            {/* Title */}
            <motion.h2
              className="text-2xl font-bold text-white mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                textShadow: '0 0 20px rgba(0, 229, 255, 0.5)',
              }}
            >
              {copy.title}
            </motion.h2>
            
            {/* Effect */}
            <motion.p
              className="text-lg text-cyan-300 mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              ➜ {copy.effect}
            </motion.p>
            
            {/* Next Step */}
            <motion.div
              className="bg-white/5 rounded-lg p-4 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm text-white/60 mb-1">🎯 PROSSIMO PASSO</p>
              <p className="text-white font-medium">{copy.nextStep}</p>
            </motion.div>
            
            {/* CTA */}
            <motion.button
              onClick={handleCta}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg text-white"
              style={{
                background: 'linear-gradient(135deg, #00E5FF 0%, #7B5CFF 100%)',
                boxShadow: '0 4px 20px rgba(0, 229, 255, 0.4)',
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {copy.cta?.label || 'CONTINUA'}
            </motion.button>
          </div>
          
          {/* Decorative glow */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 229, 255, 0.15) 0%, transparent 60%)',
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper: Get confetti colors based on event type
function getConfettiColors(type: string): string[] {
  switch (type) {
    case 'MILESTONE_REACHED':
    case 'LEVEL_UP':
      return ['#00E5FF', '#FFD700', '#FF00FF'];
    case 'RANK_UP':
      return ['#FFD700', '#FFFFFF', '#7B5CFF'];
    case 'BATTLE_WIN':
      return ['#00FF88', '#00E5FF', '#FFFFFF'];
    case 'BATTLE_LOSE':
      return ['#FF4444', '#FF8800', '#FFCC00'];
    case 'PULSE_BREAKER_CASHOUT':
      return ['#00FF88', '#00E5FF', '#FFD700'];
    case 'PULSE_BREAKER_CRASH':
      return ['#FF4444', '#FF0000', '#FF8800'];
    case 'MARKER_REWARD_CLAIMED':
      return ['#FFD700', '#FF00FF', '#00E5FF'];
    default:
      return ['#00E5FF', '#7B5CFF', '#FFFFFF'];
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

