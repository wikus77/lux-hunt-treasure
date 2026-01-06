/**
 * M1SSION™ Celebration Toast V2
 * AAA game-feel CENTERED toast notification with glass design
 * LARGE SIZE - Double the original for maximum visibility
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { GameEvent, getEventCopy, cancelAutoDismiss, startAutoDismiss } from '@/gameplay/events';
import { GLASS_PRESETS, getGlassVariantForEvent, MOTION_PRESETS, M1SSION_COLORS } from './glassPresets';

interface CelebrationToastProps {
  event: GameEvent;
  onDismiss: () => void;
  onCtaClick: (path: string) => void;
}

export const CelebrationToast: React.FC<CelebrationToastProps> = ({
  event,
  onDismiss,
  onCtaClick,
}) => {
  const copy = getEventCopy(event);
  const variant = getGlassVariantForEvent(event.type);
  const preset = GLASS_PRESETS[variant];
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Haptic feedback on mount
  useEffect(() => {
    if (navigator.vibrate) {
      // Pattern: short tap for minor, stronger for major
      navigator.vibrate(event.priority === 'major' ? [30, 20, 50] : [25]);
    }
  }, [event.priority]);
  
  // Handle click on toast
  const handleClick = () => {
    if (copy.cta) {
      onCtaClick(copy.cta.path);
    }
  };
  
  return (
    <AnimatePresence>
      {/* CENTERED FULL-SCREEN OVERLAY */}
      <motion.div
        className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none px-4"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Semi-transparent backdrop */}
        <motion.div
          className="absolute inset-0 pointer-events-auto"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        />
        
        {/* LARGE CENTERED TOAST */}
        <motion.div
          className="relative w-full max-w-lg rounded-3xl overflow-hidden pointer-events-auto cursor-pointer backdrop-blur-xl"
          style={{
            background: preset.background,
            border: preset.border,
            boxShadow: preset.boxShadow,
          }}
          onClick={handleClick}
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', damping: 18, stiffness: 250 }}
          whileHover={{ scale: 1.02, boxShadow: preset.boxShadow.replace('0.3', '0.5') }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => cancelAutoDismiss()}
          onMouseLeave={() => startAutoDismiss()}
        >
          {/* Ambient glow effect */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${preset.glowColor} 0%, transparent 60%)`,
            }}
          />
          
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              border: `2px solid ${preset.textColor}`,
              opacity: 0.2,
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
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
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
          >
            <X className="w-5 h-5 text-white/80" />
          </motion.button>
          
          <div className="relative p-8">
            {/* Large Icon with glow */}
            <div className="flex justify-center mb-6">
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
              >
                {/* Icon glow backdrop */}
                <div 
                  className="absolute inset-0 blur-2xl opacity-60"
                  style={{ 
                    fontSize: '5rem',
                    filter: `drop-shadow(0 0 25px ${preset.glowColor})`,
                  }}
                >
                  {copy.icon}
                </div>
                {/* Icon */}
                <span 
                  className="relative z-10 text-6xl block"
                  style={{ 
                    filter: `drop-shadow(0 0 15px ${preset.glowColor})`,
                  }}
                >
                  {copy.icon}
                </span>
              </motion.div>
            </div>
            
            {/* Title - Large */}
            <motion.p
              className="font-bold text-2xl text-center mb-3"
              style={{ 
                color: preset.textColor,
                textShadow: `0 0 25px ${preset.glowColor}`,
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {copy.title}
            </motion.p>
            
            {/* Effect - Medium */}
            <motion.p
              className="text-white/90 text-lg text-center mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ➜ {copy.effect}
            </motion.p>
            
            {/* CTA Button */}
            {copy.cta && (
              <motion.div
                className="flex justify-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <motion.div
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base"
                  style={{
                    background: `linear-gradient(135deg, ${preset.textColor} 0%, ${preset.accentColor} 100%)`,
                    color: '#000',
                    boxShadow: `0 4px 20px ${preset.glowColor}`,
                  }}
                  whileHover={{ scale: 1.05, boxShadow: `0 6px 30px ${preset.glowColor}` }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copy.cta.label}
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </motion.div>
            )}
          </div>
          
          {/* Progress bar for auto-dismiss */}
          <div className="h-1.5 bg-white/10 overflow-hidden">
            <motion.div
              ref={progressRef}
              className="h-full origin-left"
              style={{ 
                background: `linear-gradient(90deg, ${preset.textColor}, ${preset.accentColor})`,
              }}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 3.5, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
