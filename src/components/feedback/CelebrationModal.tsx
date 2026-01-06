/**
 * M1SSION™ Celebration Modal V2
 * AAA game-feel celebration overlay with premium glass design
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameEvent, getEventCopy } from '@/gameplay/events';
import { GLASS_PRESETS, getGlassVariantForEvent, MOTION_PRESETS, M1SSION_COLORS } from './glassPresets';

interface CelebrationModalProps {
  event: GameEvent;
  onDismiss: () => void;
  onCtaClick: (path: string) => void;
}

// Confetti colors by variant
const CONFETTI_COLORS: Record<string, string[]> = {
  success: [M1SSION_COLORS.green, M1SSION_COLORS.cyan, '#FFFFFF'],
  gold: [M1SSION_COLORS.gold, M1SSION_COLORS.magenta, M1SSION_COLORS.cyan],
  warning: [M1SSION_COLORS.amber, M1SSION_COLORS.gold, '#FFFFFF'],
  error: [M1SSION_COLORS.red, M1SSION_COLORS.amber, '#FF8888'],
  neutral: [M1SSION_COLORS.cyan, M1SSION_COLORS.magenta, '#FFFFFF'],
};

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  event,
  onDismiss,
  onCtaClick,
}) => {
  const copy = getEventCopy(event);
  const variant = getGlassVariantForEvent(event.type);
  const preset = GLASS_PRESETS[variant];
  const animationRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  
  // Trigger confetti on mount with proper cleanup
  useEffect(() => {
    isMountedRef.current = true;
    const duration = 2500;
    const end = Date.now() + duration;
    
    const colors = CONFETTI_COLORS[variant] || CONFETTI_COLORS.neutral;
    
    // Initial burst
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors,
      scalar: 1.2,
    });
    
    // Continuous rain
    const frame = () => {
      if (!isMountedRef.current) return;
      
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
      });
      
      if (Date.now() < end && isMountedRef.current) {
        animationRef.current = requestAnimationFrame(frame);
      }
    };
    
    // Start after initial burst
    setTimeout(() => {
      if (isMountedRef.current) frame();
    }, 300);
    
    // Haptic feedback pattern
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 80, 30, 50]);
    }
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [variant]);
  
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
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onDismiss()}
      >
        {/* Backdrop with blur */}
        <motion.div
          className="absolute inset-0 backdrop-blur-md"
          style={{ background: 'rgba(0, 0, 0, 0.85)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        
        {/* Modal Content */}
        <motion.div
          className="relative max-w-md w-full rounded-3xl overflow-hidden"
          style={{
            background: preset.background,
            border: preset.border,
            boxShadow: preset.boxShadow,
          }}
          {...MOTION_PRESETS.modalEnter}
        >
          {/* Ambient glow overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${preset.glowColor} 0%, transparent 50%)`,
            }}
          />
          
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              border: `2px solid ${preset.textColor}`,
              opacity: 0.3,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              boxShadow: [
                `0 0 20px ${preset.glowColor}`,
                `0 0 40px ${preset.glowColor}`,
                `0 0 20px ${preset.glowColor}`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Close button */}
          <motion.button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2.5 rounded-full z-10 transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
            whileHover={{ 
              background: 'rgba(255, 255, 255, 0.2)',
              scale: 1.1,
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="Chiudi"
          >
            <X className="w-5 h-5 text-white/80" />
          </motion.button>
          
          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Large Icon with glow */}
            <motion.div
              className="relative mb-6 inline-block"
              {...MOTION_PRESETS.iconBounce}
            >
              {/* Glow effect */}
              <div 
                className="absolute inset-0 blur-2xl opacity-60 text-7xl"
                style={{ 
                  filter: `drop-shadow(0 0 30px ${preset.glowColor})`,
                }}
              >
                {copy.icon}
              </div>
              {/* Icon */}
              <span 
                className="relative z-10 text-7xl block"
                style={{ 
                  filter: `drop-shadow(0 0 15px ${preset.glowColor})`,
                }}
              >
                {copy.icon}
              </span>
            </motion.div>
            
            {/* Title */}
            <motion.h2
              className="text-2xl font-bold mb-3"
              style={{
                color: preset.textColor,
                textShadow: `0 0 30px ${preset.glowColor}`,
              }}
              {...MOTION_PRESETS.textStagger(0.2)}
            >
              {copy.title}
            </motion.h2>
            
            {/* Effect */}
            <motion.p
              className="text-lg mb-6"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              {...MOTION_PRESETS.textStagger(0.3)}
            >
              ➜ {copy.effect}
            </motion.p>
            
            {/* Next Step Card */}
            <motion.div
              className="rounded-xl p-4 mb-6"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              {...MOTION_PRESETS.textStagger(0.4)}
            >
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">
                🎯 PROSSIMO PASSO
              </p>
              <p className="text-white font-medium">{copy.nextStep}</p>
            </motion.div>
            
            {/* CTA Button */}
            <motion.button
              onClick={handleCta}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${preset.textColor} 0%, ${preset.accentColor} 100%)`,
                boxShadow: `0 4px 25px ${preset.glowColor}`,
              }}
              {...MOTION_PRESETS.textStagger(0.5)}
              whileHover={{ 
                scale: 1.02,
                boxShadow: `0 6px 35px ${preset.glowColor}`,
              }}
              whileTap={{ scale: 0.98 }}
            >
              {copy.cta?.label || 'CONTINUA'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
